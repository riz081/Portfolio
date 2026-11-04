package storage

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/rizqika/portfolio/backend/internal/config"
)

type Storage interface {
	Upload(ctx context.Context, reader io.Reader, size int64, contentType, ext string, folder string) (string, string, error)
}

type MinioStorage struct {
	client    *minio.Client
	cfg       config.S3Config
	bucket    string
	region    string
	publicURL string
}

func NewMinio(cfg config.S3Config) (*MinioStorage, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, err
	}
	return &MinioStorage{
		client:    client,
		cfg:       cfg,
		bucket:    cfg.Bucket,
		region:    "us-east-1",
		publicURL: strings.TrimRight(cfg.PublicURL, "/"),
	}, nil
}

// EnsureBucket creates the bucket if it does not exist, retrying briefly for
// services (like MinIO) that need a moment to become ready before first use.
func (m *MinioStorage) EnsureBucket(ctx context.Context) error {
	var err error
	for attempt := 0; attempt < 10; attempt++ {
		exists, e := m.client.BucketExists(ctx, m.bucket)
		if e != nil {
			err = e
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(2 * time.Second):
				continue
			}
		}
		if exists {
			if perr := m.setPublicReadPolicy(ctx); perr != nil {
				return perr
			}
			return nil
		}
		if e := m.client.MakeBucket(ctx, m.bucket, minio.MakeBucketOptions{Region: m.region}); e == nil {
			if perr := m.setPublicReadPolicy(ctx); perr != nil {
				return perr
			}
			return nil
		} else {
			err = e
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(2 * time.Second):
			}
		}
	}
	return err
}

// setPublicReadPolicy allows anonymous read (s3:GetObject) on the media bucket,
// so uploaded image URLs resolve publicly.
func (m *MinioStorage) setPublicReadPolicy(ctx context.Context) error {
	policy := fmt.Sprintf(`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::%s/*"]
    }
  ]
}`, m.bucket)
	return m.client.SetBucketPolicy(ctx, m.bucket, policy)
}

func (m *MinioStorage) Upload(ctx context.Context, reader io.Reader, size int64, contentType, ext string, folder string) (string, string, error) {
	if folder == "" {
		folder = "misc"
	}
	key := filepath.ToSlash(filepath.Join(fmt.Sprintf("%s/2026", folder), uuid.NewString()+"."+strings.TrimPrefix(ext, ".")))

	_, err := m.client.PutObject(ctx, m.bucket, key, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", "", err
	}

	url := fmt.Sprintf("%s/%s", m.publicURL, key)
	return url, key, nil
}
