import styled from 'styled-components';
import { c } from '../utils/Themes';

export const LAYERS = ['Client', 'API', 'Services', 'Data'];

const SERVER_TAGS = /laravel|nestjs|golang|\bgo\b|\bgin\b|express|django|spring/i;

// Which layers of the stack a project touched, derived from its CMS category and tags.
export const layersForProject = (project) => {
  const category = project?.category || '';
  if (category.includes('fullstack')) return LAYERS;
  if (category.includes('backend')) return ['API', 'Services', 'Data'];
  const hasServerTag = project?.tags?.some((tag) => SERVER_TAGS.test(tag.name));
  return hasServerTag ? ['Client', 'API', 'Services'] : ['Client'];
};

const CX = 142;
const CY = 120;
const HALF_W = 100;
const HALF_H = 52;

// Maps plate coordinates (u, v in -0.5..0.5) onto the isometric plate.
const iso = (u, v) => [CX + (u - v) * HALF_W, CY + (u + v) * HALF_H];
const quad = (u, v, w, h) => [iso(u, v), iso(u + w, v), iso(u + w, v + h), iso(u, v + h)]
  .map((point) => point.join(',')).join(' ');

const hash = (text = '') => [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);

// Small interface blocks, seeded by title, so each project's diagram differs.
const seededBlocks = (seed, count) => Array.from({ length: count }, (_, i) => {
  const n = (seed * (i + 3) * 37) % 997;
  return { u: -0.04 + ((n % 7) / 7) * 0.32, v: -0.36 + (i / count) * 0.72, w: 0.06 + ((n % 3) * 0.04) };
});

const Svg = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  --spread: ${({ $open }) => ($open ? '30px' : '10px')};

  .plate {
    transition: transform 420ms ${c('ease')};
    transform: translateY(calc(var(--spread) * var(--i)));
  }

  text {
    font-family: ${c('fontBody')};
    font-size: 15px;
    font-weight: 500;
    transition: opacity 240ms ease;
    opacity: ${({ $open }) => ($open ? 1 : 0)};
  }
`;

const StackDiagram = ({ active = LAYERS, device = 'web', title = '', open = true, className }) => {
  const seed = hash(title);
  // Drawn bottom plate first so upper plates overlap correctly.
  const ordered = LAYERS.map((name, index) => ({ name, offset: index - 1.5 })).reverse();

  return (
    <Svg viewBox="0 0 400 240" aria-hidden="true" focusable="false" $open={open} className={className}>
      {ordered.map(({ name, offset }) => {
        const lit = active.includes(name);
        const stroke = lit ? '#A78BFA' : '#34445A';
        return (
          <g key={name} className="plate" style={{ '--i': offset }}>
            <path
              d={`M${CX - HALF_W} ${CY} L${CX} ${CY + HALF_H} L${CX + HALF_W} ${CY} v7 L${CX} ${CY + HALF_H + 7} L${CX - HALF_W} ${CY + 7} Z`}
              fill="#101826"
              stroke={stroke}
            />
            <polygon
              points={`${CX},${CY - HALF_H} ${CX + HALF_W},${CY} ${CX},${CY + HALF_H} ${CX - HALF_W},${CY}`}
              fill={lit ? '#202C3B' : '#18222F'}
              stroke={stroke}
            />
            {name === 'Client' && lit && (
              <>
                <polygon
                  points={device === 'mobile' ? quad(-0.34, -0.14, 0.2, 0.42) : quad(-0.38, -0.3, 0.3, 0.6)}
                  fill="none"
                  stroke="#A78BFA"
                />
                {seededBlocks(seed, device === 'mobile' ? 3 : 4).map((block) => (
                  <polygon
                    key={block.v}
                    points={quad(block.u, block.v, block.w + 0.1, 0.1)}
                    fill="#A78BFA"
                    opacity="0.45"
                  />
                ))}
              </>
            )}
            <line x1={CX + HALF_W} y1={CY} x2={CX + HALF_W + 20} y2={CY} stroke={stroke} />
            <text x={CX + HALF_W + 28} y={CY + 5} fill={lit ? '#A78BFA' : '#A3B0BF'}>{name}</text>
          </g>
        );
      })}
    </Svg>
  );
};

export default StackDiagram;
