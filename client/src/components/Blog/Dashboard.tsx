import React from 'react';
import { Link } from 'react-router-dom';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

import './Dashboard.scss';

import { getConfigUrlSrvBlog, getConfigRoutesBlog } from 'config';
import { Blog } from 'shared/interfaces/blog';
import { User } from 'shared/interfaces/user';
import HttpService from 'shared/services/HttpService';
import BlogService from 'shared/services/blog.service';
import ButtonWidget from 'shared/components/widgets/button/button';
import PieChart from 'shared/components/charts/PieChart';


interface ComponentState {
  latestBlogs: Blog[];
  mostSeenBlogs: Blog[];
  topSeenAuthors: User[];
  mostSeenCountries: string[];
}

interface Props {

}

class Dashboard extends React.Component<Props, ComponentState> {
  private _httpService: HttpService = new HttpService();
  private _service: BlogService = new BlogService();
  state = {
    latestBlogs: [],
    mostSeenBlogs: [],
    topSeenAuthors: [],
    mostSeenCountries: [],
  };

  componentDidMount() {
    this.getMostSeenBlogs();
    this.getLatestBlogs();
    this.getTopSeenAuthors();
    this.getMostSeenCountries();
  }

  getMostSeenBlogs() {
    const params = {limit: 5, ordering: '-views'};
    this._service.getActivatedBlogs(params).then((response: Blog[]) => {
      this.setState({
        mostSeenBlogs: response,
      })
    }).catch(err => {});
  }

  getLatestBlogs() {
    const params = {limit: 5};
    this._service.getActivatedBlogs(params).then((response: Blog[]) => {
      this.setState({
        latestBlogs: response,
      })
    }).catch(err => {});
  }

  getTopSeenAuthors() {
    const url = getConfigUrlSrvBlog('authors');
    const params = {limit: 5, ordering: '-views'};
    this._httpService.get(url, params).then((response: User[]) => {
      this.setState({
        topSeenAuthors: response,
      })
    }).catch(err => {});
  }

  getMostSeenCountries() {
    const url = getConfigUrlSrvBlog('countries');;
    const params = {limit: 5, ordering: '-views'};
    this._httpService.get(url, params).then((response: string[]) => {
      this.setState({
        mostSeenCountries: response,
      })
    }).catch(err => {});
  }

  render() {
    return (
      <div className="blog-dashboard">
        <Card className="blog-dashboard__card blog-dashboard__authors-count">
          <header className="blog-dashboard__header">Views snapshot</header>
          <PieChart
            data={this.state.mostSeenBlogs.map((elem: Blog) => ({
              name: elem.title,
              value: elem.views,
              href: getConfigRoutesBlog('detail')(elem.id)
            })).slice(0, 5)}
            classSvgName="charts-main__svg-pie"
            setPickedData={(name: string) => {}}
            width={560}
          />
        </Card>

        <Card className="blog-dashboard__card blog-dashboard__b">
          <div className="blog-dashboard__stat">
            <div className="blog-dashboard__eyebrow">Authors</div>
            <div className="blog-dashboard__stat-value">{this.state.topSeenAuthors.length}</div>
            <div className="blog-dashboard__stat-copy">active voices highlighted in the dashboard</div>
          </div>
        </Card>

        <Card className="blog-dashboard__card blog-dashboard__c">
          <div className="blog-dashboard__stat">
            <div className="blog-dashboard__eyebrow">Regions</div>
            <div className="blog-dashboard__stat-value">{this.state.mostSeenCountries.length}</div>
            <div className="blog-dashboard__stat-copy">popular places readers explore right now</div>
          </div>
        </Card>

        <Card className="blog-dashboard__card blog-dashboard__most-seen-blogs">
          <div className="blog-dashboard__card-content">
            <header className="blog-dashboard__header">Most seen blogs</header>
            {!this.state.mostSeenBlogs.length && <div className="blog-dashboard__loading"><CircularProgress color="secondary" /></div>}
            {this.state.mostSeenBlogs.map((blog: Blog) => {
              return (
                <Link to={getConfigRoutesBlog('detail')(blog.id)} className="blog-dashboard__list-elem-link" key={blog.id}>
                  <ArrowRightIcon fontSize="inherit" />
                  <div className="blog-dashboard__list-element-text">{blog.title}</div>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card className="blog-dashboard__card blog-dashboard__latest-blogs">
          <div className="blog-dashboard__card-content">
            <header className="blog-dashboard__header">Latest blogs</header>
            {!this.state.latestBlogs.length && <div className="blog-dashboard__loading"><CircularProgress color="secondary" /></div>}
            {this.state.latestBlogs.map((blog: Blog) => {
              return (
                <Link to={getConfigRoutesBlog('detail')(blog.id)} className="blog-dashboard__list-elem-link" key={blog.id}>
                  <ArrowRightIcon fontSize="inherit" />
                  <div className="blog-dashboard__list-element-text">{blog.title}</div>
                </Link>
              )
            })}
          </div>
        </Card>


        <Card className="blog-dashboard__card blog-dashboard__top-seen-authors">
          <div className="blog-dashboard__card-content">
            <header className="blog-dashboard__header">Top 5 seen authors</header>
            {!this.state.topSeenAuthors.length && <div className="blog-dashboard__loading"><CircularProgress color="secondary" /></div>}
            {this.state.topSeenAuthors.map((user: User, index: number) => {
              return (
                <div key={index}>{user.username}</div>
              )
            })}
            <footer className="blog-dashboard__actions">
              <Link
                to={getConfigRoutesBlog('authors')}
                state={{
                  authors: this.state.topSeenAuthors
                }}
              >
                <ButtonWidget text="Visit" />
              </Link>
            </footer>
          </div>
        </Card>

        <Card className="blog-dashboard__card blog-dashboard__most-seen-countries">
          <div className="blog-dashboard__card-content">
            <header className="blog-dashboard__header">Most seen countries</header>
            {!this.state.mostSeenCountries.length && <div className="blog-dashboard__loading"><CircularProgress color="secondary" /></div>}
            {this.state.mostSeenCountries.map((country: string, index: number) => {
              return (
                <div key={index}>{country}</div>
              )
            })}
            <footer className="blog-dashboard__actions">
              <Link
                  to={getConfigRoutesBlog('sites')}
                  state={{
                    countries: this.state.mostSeenCountries
                  }}
                >
                  <ButtonWidget text="Visit" />
                </Link>
            </footer>
          </div>
        </Card>

        <Card className="blog-dashboard__card blog-dashboard__cta">
          <div className="blog-dashboard__feature">
            <div className="blog-dashboard__eyebrow">Start writing</div>
            <div className="blog-dashboard__feature-title">Share your next journey</div>
            <div className="blog-dashboard__feature-copy">Turn a route, a photo and a few notes into a polished travel story.</div>
            <div className="blog-dashboard__feature-action">
              <Link to={getConfigRoutesBlog('addNew')}>
                <ButtonWidget text="Create story" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }
};

export default Dashboard;