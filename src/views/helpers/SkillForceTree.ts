import { drag as d3Drag } from 'https://cdn.jsdelivr.net/npm/d3-drag@3/+esm';
import * as d3Force from 'https://cdn.jsdelivr.net/npm/d3-force@3/+esm';
import * as d3Select from 'https://cdn.jsdelivr.net/npm/d3-selection@3/+esm';
import { type HierarchyNode } from 'https://cdn.jsdelivr.net/npm/d3-hierarchy@3/+esm';
import { type SkillView } from '../Skill';
import { type SkillEntry } from '../../models/Skill';

export function appendSkillTree({ root, selector, skills }: SkillView): void {
  if (!root.value) {
    console.warn('expected empty root', skills.value, root.value);
    return;
  }

  const rootNode = root.value;
  const width = 900;
  const height = 600;

  const nodes = rootNode.descendants();
  const links = rootNode.links();

  const simulation = getSimulation(nodes, links);
  const svg = getSVG(width, height);
  const [ drawnNodes, drawnLinks, drawnLabels ] = getDrawPieces(svg, nodes, links);

  drawnNodes.call(drag(simulation));
  simulation.on('tick', ticked);

  d3Select.select(selector).append(() => svg.node());

  function ticked() {
    drawnLinks.attr('x1', (d) => d.source.x ?? null)
      .attr('y1', (d) => d.source.y ?? null)
      .attr('x2', (d) => d.target.x ?? null)
      .attr('y2', (d) => d.target.y ?? null);
    drawnNodes.attr('cx', (d) => d.x ?? null)
      .attr('cy', (d) => d.y ?? null);
    drawnLabels.attr('x', function moveX(d) {
      return !d.x
        ? null
        : d.x - (this.getComputedTextLength() / 2);
    })
      .attr('y', (d) => (!d.y ? null : d.y + 6.5));
  }
}

function getSimulation(
  nodes: SimulationNodeCompat[],
  links: StrictSimulationLinkDatum<SimulationNodeCompat>[],
): d3Force.Simulation<
    SimulationNodeCompat, d3Force.SimulationLinkDatum<SimulationNodeCompat>
> {
  return d3Force.forceSimulation<
    SimulationNodeCompat, StrictSimulationLinkDatum<SimulationNodeCompat>
  >(nodes)
    .force('link', d3Force.forceLink<SimulationNodeCompat, StrictSimulationLinkDatum<SimulationNodeCompat>>(links)
      .id((d) => d.data.text)
      .distance((d) => getNodeRadius(d.source)
        + getNodeRadius(d.target)
        + (7 - d.source.depth) * 5)
      .strength(1.5))
    .force('charge', d3Force.forceManyBody().strength(-200))
    .force('collide', d3Force.forceCollide((d) => getNodeRadius(d) + 3));
}

function getSVG(width: number, height: number) {
  const svg = d3Select.create<SVGElement>('svg');

  svg.attr('class', 'svg-scl-aspx')
    .attr('viewBox', [ -width / 2, -height / 2, width, height ]);
  return svg;
}

function getDrawPieces(
  svg: d3Select.Selection<SVGElement, undefined, null, undefined>,
  nodes: SimulationNodeCompat[],
  links: StrictSimulationLinkDatum<SimulationNodeCompat>[],
): [
  d3Select.Selection<Element, SimulationNodeCompat, SVGElement, undefined>,
  d3Select.Selection<Element, StrictSimulationLinkDatum<SimulationNodeCompat>,
    SVGElement, undefined>,
  d3Select.Selection<SVGTextElement, SimulationNodeCompat, SVGElement, undefined>,
] {
  const link = svg.append('g')
    .attr('class', 'link')
    .attr('stroke', 'hsl(0deg 0% 60%)')
    .attr('stroke-opacity', 0.6);

  /** linkWithData + nodeWithData only becomes workable if it is merged with
   *  our tree via `d3#join`
   */
  const linkWithData = link.selectAll<
    Element, StrictSimulationLinkDatum<SimulationNodeCompat>
  >('line')
    .data(links)
    .join('line')
    .attr('stroke-width', (d) => (7 - d.source.depth) / 2);

  const node = svg.append('g')
    .attr('class', 'node svg-node-bg svg-node-fg');
  const nodeWithData = node.selectAll<Element, SimulationNodeCompat>('circle')
    .data(nodes)
    .join('circle')
    .attr('r', getNodeRadius);

  const label = svg.append('g')
    .attr('class', 'label svg-label-fg svg-label-fnt-s no-m-intx');
  const labelWithData = label.selectAll<SVGTextElement, SimulationNodeCompat>('text')
    .data(nodes)
    .join('text')
    .text((d) => d.data.text);

  nodeWithData.append('title').text((d) => d.data.text);
  return [ nodeWithData, linkWithData, labelWithData ];
}

function getNodeRadius(d: SimulationNodeCompat) {
  return (7 - d.depth) * 3 + d.data.text.length * 2.45;
}

function drag(sim: d3Force.Simulation<
  SimulationNodeCompat, d3Force.SimulationLinkDatum<SimulationNodeCompat>
>) {
  return d3Drag<Element, SimulationNodeCompat>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);

  function dragstarted(event: MediaStream, d: SimulationNodeCompat) {
    if (!event.active) sim.alphaTarget(0.3).restart();
    // eslint-disable-next-line no-param-reassign
    d.fx = d.x;
    // eslint-disable-next-line no-param-reassign
    d.fy = d.y;
  }

  function dragged(event: MouseEvent, d: SimulationNodeCompat) {
    // eslint-disable-next-line no-param-reassign
    d.fx = event.x;
    // eslint-disable-next-line no-param-reassign
    d.fy = event.y;
  }

  function dragended(event: MediaStream, d: SimulationNodeCompat) {
    if (!event.active) sim.alphaTarget(0);
    // eslint-disable-next-line no-param-reassign
    d.fx = null;
    // eslint-disable-next-line no-param-reassign
    d.fy = null;
  }
}

interface SimulationNodeCompat
  extends HierarchyNode<SkillEntry>, d3Force.SimulationNodeDatum {
  depth: number;
}

interface StrictSimulationLinkDatum<SimulationNode extends d3Force.SimulationNodeDatum>
  extends d3Force.SimulationLinkDatum<SimulationNode> {
  source: SimulationNode;
  target: SimulationNode;
}
