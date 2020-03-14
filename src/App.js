import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import _ from 'lodash';
import Expenses from './visualizations/Expenses';
import Categories from './visualizations/Categories';

import expensesData from './data/expenses.json';

var width = 750;
var height = 1800;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      expenses: [],
      selectedWeek: null,
      categories: [
        { name: 'Groceries', expenses: [], total: 0 },
        { name: 'Restaurants', expenses: [], total: 0 },
      ],
    };

    this.prevWeek = this.prevWeek.bind(this);
    this.nextWeek = this.nextWeek.bind(this);
    this.linkToCategory = this.linkToCategory.bind(this);
    this.editDate = this.editDate.bind(this);
  }

  componentWillMount() {
    // process data
    var expenses = _.chain(expensesData)
      .filter(d => d.Amount < 0)
      .map(d => {
        return {
          amount: -d.Amount,
          name: d.Description,
          date: new Date(d['Trans Date']),
        }
      }).value();

    // default selected week will be the most recent week
    var selectedWeek = d3.max(expenses, exp => d3.timeWeek.floor(exp.date));

    this.setState({ expenses, selectedWeek });
  }

  prevWeek() {
    // todo: error handling
    var selectedWeek = d3.timeWeek.offset(this.state.selectedWeek, -1);
    this.setState({ selectedWeek });
  }

  nextWeek() {
    // todo: error handling
    var selectedWeek = d3.timeWeek.offset(this.state.selectedWeek, 1);
    this.setState({ selectedWeek });
  }

  linkToCategory(expense, category) {
    if (_.includes(category.expenses, expense)) {
      category.expenses = _.without(category.expenses, expense);
    } else {
      category.expenses.push(expense);
    }

    this.forceUpdate();
  }

  editDate(expense, day) {
    expense.date = day.date;
    this.forceUpdate();
  }

  render() {
    var selectedWeek = d3.timeFormat('%B %d, %Y')(this.state.selectedWeek);
    var links = [];
    _.each(this.state.categories, category => {
      // update category total correctly
      category.total = 0;
      _.each(category.expenses, expense => {
        // only when category's expense is in the selected week
        if (d3.timeWeek.floor(expense.date).getTime() === this.state.selectedWeek.getTime()) {
          // then we give it a visual link
          links.push({
            source: expense,
            target: category,
          })
          category.total += expense.amount;
        }
      });
    });

    var style = {
      width,
      margin: 'auto',
    }
    var props = {
      width,
      links,
      linkToCategory: this.linkToCategory,
      editDate: this.editDate,
    };


    return (
      <div className='App' style={style}>
        <h2 style={{ textAlign: 'center' }}>
          <span onClick={this.prevWeek}>← </span>
          Week of {selectedWeek}
          <span onClick={this.nextWeek}> →</span>
        </h2>
        <svg width={width} height={height}>
          <Categories {...props} {...this.state} />
          <Expenses {...props} {...this.state} />
        </svg>
      </div>
    );
  }
}

export default App;