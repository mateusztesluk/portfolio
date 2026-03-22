import React from 'react';

import './PieChart.scss';

import * as d3 from 'd3';
import { PropsBasic, DataBasic } from './interfaces';

interface State {

}

interface Props extends PropsBasic {

}

class PieChart extends React.Component<Props, State> {
  openEntry(data: DataBasic) {
    if (data.href) {
      window.location.assign(data.href);
    }
  }

  getChartData() {
    return this.props.data.filter((entry: DataBasic) => entry.value > 0);
  }

  componentDidMount() {
    const data: DataBasic[] = this.getChartData();
    const width: number = this.props.width;
    const height: number = Math.round(width * 0.72);
    this._prepareChart(height, width, data);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.data !== prevProps.data) {
      const data: DataBasic[] = this.getChartData();
      const width: number = this.props.width;
      const height: number = Math.round(width * 0.72);
      this._prepareChart(height, width, data);
    }
  }

  _prepareChart(height: number, width: number, data: DataBasic[]) {
    const svg = d3.select(`.${this.props.classSvgName}`);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', [0, 0, width, height] as any)
      .attr('role', 'img')
      .attr('aria-label', 'Most viewed blog posts chart');

    if (!data.length) {
      svg.append('text')
        .attr('class', 'pie-chart__empty')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('No data yet');
      return;
    }

    const palette = ['#2f6690', '#d07a47', '#7b9e87', '#c45858', '#d9b44a'];
    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(palette);

    const outerRadius = Math.min(width, height) * 0.34;
    const innerRadius = outerRadius * 0.58;

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(8)
      .padAngle(0.02);

    const pie = d3.pie()
      .sort(null)
      .value((d: any) => d.value);

    const arcs = pie(data as any);
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${width * 0.3}, ${height * 0.56})`);

    chartGroup.append('g')
      .attr('stroke', 'rgba(255,255,255,0.95)')
      .attr('stroke-width', 2)
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', d => color((d.data as any).name) as any)
      .attr('d', arc as any)
      .style('cursor', d => (d.data as any).href ? 'pointer' : 'default')
      .style('transition', 'transform 180ms ease, filter 180ms ease')
      .on('mouseover', d => {
        this.props.setPickedData((d.data as any).name);
      })
      .on('click', d => {
        this.openEntry(d.data as DataBasic);
      })
      .on('mouseenter', function (this: SVGPathElement) {
        d3.select(this)
          .attr('filter', 'drop-shadow(0 12px 18px rgba(17,35,43,0.18))')
          .attr('transform', 'scale(1.02)');
      })
      .on('mouseleave', function (this: SVGPathElement) {
        d3.select(this)
          .attr('filter', null)
          .attr('transform', 'scale(1)');
      })
      .append('title')
      .text(d => `${(d.data as any).name}: ${(d.data as any).value}`);

    chartGroup.append('text')
      .attr('class', 'pie-chart__total-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', 22)
      .attr('y', -10)
      .text('Views');

    chartGroup.append('text')
      .attr('class', 'pie-chart__total-value')
      .attr('text-anchor', 'middle')
      .attr('font-size', 62)
      .attr('y', 28)
      .text(d3.sum(data, (entry: DataBasic) => entry.value).toLocaleString());

    const legend = svg.append('g')
      .attr('transform', `translate(${width * 0.60}, ${height * 0.29})`);

    const legendItems = legend.selectAll('g')
      .data(data)
      .join('g')
      .attr('transform', (_d, index) => `translate(0, ${index * 62})`)
      .style('cursor', d => d.href ? 'pointer' : 'default')
      .on('click', d => {
        this.openEntry(d as DataBasic);
      });

    legendItems.append('title')
      .text((d: DataBasic) => `${d.name}: ${d.value.toLocaleString()} views`);

    legendItems.append('circle')
      .attr('r', 9)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('fill', d => color(d.name) as string);

    legendItems.append('text')
      .attr('class', 'pie-chart__legend-name')
      .attr('x', 24)
      .attr('font-size', 24)
      .attr('y', -4)
      .text((d: DataBasic) => this.truncateLabel(d.name, width));

    legendItems.append('text')
      .attr('class', 'pie-chart__legend-value')
      .attr('x', 24)
      .attr('font-size', 20)
      .attr('y', 20)
      .text((d: DataBasic) => `${d.value.toLocaleString()} views`);
  }

  truncateLabel(name: string, chartWidth: number) {
    const legendWidth = chartWidth * 0.28;
    const leftPadding = 32;
    const fontSize = 24;
    const averageCharWidth = fontSize * 0.58;
    const availableWidth = Math.max(legendWidth - leftPadding, averageCharWidth * 9);
    const maxChars = Math.max(9, Math.floor(availableWidth / averageCharWidth));

    return name.length > maxChars ? `${name.slice(0, maxChars - 3).trimEnd()}...` : name;
  }

  render() {
    return (
      <svg className={`${this.props.classSvgName} pie-chart`}></svg>
    )
  }
}

export default PieChart;