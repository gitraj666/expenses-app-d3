import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var radiusScale = d3.scaleLinear().range([15, 50]);
var simulation = d3.forceSimulation()
    .alphaDecay(0.001)
    .velocityDecay(0.3)
    .force('collide', d3.forceCollide(d => d.radius + 10))
    .force('x', d3.forceX(d => d.focusX))
    .force('y', d3.forceY(d => d.focusY))
    .stop();

var height = 600;
// var margin = { left: 60, top: 20, right: 40, bottom: 20 };

class Categories extends Component {

    constructor(props) {
        super(props);
        this.state = {};

        this.forceTick = this.forceTick.bind(this);
        simulation.on('tick', this.forceTick);
    }

    componentDidMount() {
        this.container = d3.select(this.refs.container);
        this.calculateData();
        this.renderCircles();

        simulation.nodes(this.props.categories).alpha(0.9).restart();
    }

    componentDidUpdate() {

    }

    calculateData() {
        // calculate domain for radius (total $ amount of expenses)
        var radiusExtent = d3.extent(this.props.categories, category => category.total);
        console.log(radiusExtent);

        this.categories = _.map(this.props.categories, category => {
            return Object.assign(category, {
                radius: radiusScale(category.total),
                focusX: this.props.width / 2,
                focusY: height / 4,
            });
        });
    }

    renderCircles() {
        // update
        this.circles = this.container.selectAll('g')
            .data(this.categories);

        // exit
        this.circles.exit().remove();

        // enter
        var enter = this.circles.enter().append('g');
        enter.append('circle')
            .attr('fill', '#fff')
            .attr('stroke', '#666')
            .attr('stroke-width', 2);
        enter.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em');

        // enter + update selection
        this.circles = enter.merge(this.circles);
        this.circles.select('circle')
            .attr('r', d => d.radius);
        this.circles.select('text')
            .text(d => d.name);
    }

    forceTick() {
        this.circles.attr('transform', d => 'translate(' + [d.x, d.y] + ')');
    }

    render() {
        return (
            <g ref='container' />
        );
    }
}

export default Categories;