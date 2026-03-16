import React from 'react';

import './PieChart.scss';

import * as d3 from 'd3';
import { PropsBasic, DataBasic } from './interfaces';

interface State {

}

interface Props extends PropsBasic {

}

class PieChart extends React.Component<Props, State> {
  componentDidMount() {
    const data: DataBasic[] = this.props.data;
    const width: number = this.props.width;
    const height: number = 4/5 * width;
    this._prepareChart(height, width, data);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.data !== prevProps.data) {
      const data: DataBasic[] = this.props.data;
      const width: number = this.props.width;
      const height: number = 4/5 * width;
      this._prepareChart(height, width, data);
    }
  }

  _prepareChart(height: number, width: number, data: DataBasic[]) {
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse())

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(width, height) / 2 - 1)

    const pie = d3.pie()
      .sort(null)
      .value((d: any) => d.value)

    const arcs = pie(data as any);

    const svg = d3.select(`.${this.props.classSvgName}`)
        .attr('viewBox', [-width / 2, -height / 2, width, height] as any);

    svg.append('g')
      .attr('stroke', 'white')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', d => color((d.data as any).name) as any)
      .attr('d', arc as any)
      .on('mouseover', d => {
        this.props.setPickedData((d.data as any).name);
      })
      .append('title')
      .text(d => (d.data as any).name);

    svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
    .selectAll('text')
    .data(arcs)
    .join('text')
    .attr('transform', (d: any) => {
      d.innerRadius = 0;
      d.outerRadius = 100;
      let pos = arc.centroid(d);
      return 'translate(' + pos + ')';
  })
      .call(text => text.append('tspan')
          .attr('y', '-0.4rem')
          .attr('font-weight', 'bold')
          .text((d: any) => `${d.data.name.slice(0, 7)}...`))
      .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
          .attr('x', 0)
          .attr('y', '0.7rem')
          .attr('fill-opacity', 0.7)
          .text((d: any) => d.data.value.toLocaleString()));
  }

  render() {
    return (
      <svg className={this.props.classSvgName}></svg>
    )
  }
}

export default PieChart;