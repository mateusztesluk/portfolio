import React from 'react';
import { Link } from 'react-router-dom';

import './Dashboard.scss';


export class Dashboard extends React.Component {

  render() {
    return (
      <div className="dashboard">
          <div className="part part--1">
            <Link to="/blog" className="part__link link">
              <div className="part__quarter part__quarter--1">
                <div className="part__name part__name--1">
                  blog
                </div>
              </div>
            </Link>
          </div>
          <div className="part part--2">
            <Link to="/photos" className="part__link link">
              <div className="part__quarter part__quarter--2">
                <div className="part__name part__name--2">
                  photos
                </div>
              </div>
            </Link>
          </div>
          <div className="part part--3">
            <Link to="/monitor" className="part__link link">
              <div className="part__quarter part__quarter--3">
                <div className="part__name part__name--3">
                  monitor
                </div>
              </div>
            </Link>
          </div>
          <div className="part part--4">
            <a href="https://mtesluk.github.io/covid-eu/">
              <div className="part__quarter part__quarter--4">
                <div className="part__name part__name--4">
                  covid-19
                </div>
              </div>
            </a>
          </div>
      </div>
    );
  }
};