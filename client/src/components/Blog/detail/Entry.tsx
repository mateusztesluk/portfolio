import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import './Entry.scss';
import ButtonWidget from 'shared/components/widgets/button/button';

import { getConfigRoutesBlog } from 'config';
import { Blog, Element, ElementType } from 'shared/interfaces/blog';
import { User } from 'shared/interfaces/user';
import { notifySuccess } from 'actions/notify';
import BlogService from 'shared/services/blog.service';
import UserService from 'shared/services/user.service';
import { withRouter } from 'shared/router/withRouter';


interface Props extends ReduxState {
  match: any;
  history: any;
  notifySuccess: (msg: string) => void;
};

interface State {
  blog: Blog;
  elements: Element[];
  authors: {main: User, support: User[]}
}

interface ReduxState {
  user: User;
}


class Entry extends React.Component<Props, State> {
  _service: BlogService = new BlogService();
  _userService: UserService = new UserService();
  state = {
    blog: {id: 0, content: '', user_id: 0, title: "", cooperators: null, photo_names: null, views: 0, countries: [], add_date: '', update_date: ''},
    elements: [],
    authors: {main: {username: '', id: -1}, support: []},
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    this.getBlog(id);
  }

  getBlog(id: number) {
    this._service.getBlog(id).then((response: Blog) => {
      if (response) {
        this.setState({
          blog: response,
          elements: this._service.unformatContent(response.content, response.photo_names),
        });
        this.getAuthorsNames();
      }
    }).catch(err => {});
  }

  getAuthorsNames() {
    this._userService.getUsers(this.state.blog.user_id).then((response: User[]) => {
      this.setState({
        authors: {...this.state.authors, main: response[0]}
      });
    });

    const cooperators = this.state.blog.cooperators;
    if (cooperators) {
      this._userService.getUsers(cooperators).then((response: User[]) => {
        this.setState({
          authors: {...this.state.authors, support: response}
        });
      });
    }
  }

  removeBlog(id: number) {
    this._service.removeBlog(id).then(response => {
      this.props.notifySuccess('Blog successfully removed...');
      this.props.history.push('/blog');
    }).catch(err => err);
  }

  editBlog(id: number) {
    this.props.history.push(`/blog/edit/${id}`);
  }

  formatDate(value?: string) {
    if (!value) {
      return '';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsedDate);
  }

  renderActions() {
    const currentUserId = this.props.user?.id;
    const authorId = this.state.authors.main?.id;

    const html = (
      <div className="blog-detail__actions">
        <ButtonWidget text="Remove" onClick={(e) => this.removeBlog(this.state.blog.id)}/>
        <ButtonWidget text="Edit" onClick={(e) => this.editBlog(this.state.blog.id)}/>
      </div>
    )
    return currentUserId && authorId && currentUserId === authorId ? html : <></>;
  }

  render() {
    return (
      <div className="blog-detail">
        <div className="blog-detail__description">
          <div className="blog-detail__left">
            <div className="blog-detail__title">{this.state.blog.title}</div>
            <div className="blog-detail__region">
              Region:	{'\u00A0'}
                {this.state.blog.countries.map((country: string, index: number) => {
                  return <span className="blog-detail__region-element" key={index}>
                          <Link
                            to={getConfigRoutesBlog('sites')}
                            state={{
                              countries: [country]
                            }}
                          >
                            {country}
                          </Link>
                        </span>
                })}
            </div>
            <div className="blog-detail__author">
              Author:	{'\u00A0'}
              <Link
                to={getConfigRoutesBlog('authors')}
                state={{
                  authors: [this.state.authors.main]
                }}
              >
                {this.state.authors.main ? this.state.authors.main.username : 'Anonym'}
              </Link>
            </div>
            <div className="blog-detail__support">
              {this.state.authors.support.length ? 'Support:' : ''}
              <Link
                to={getConfigRoutesBlog('authors')}
                state={{
                  authors: this.state.authors.support
                }}
              >
                {this.state.authors.support.map((user: User, index: number) => <span className="blog-detail__support-author" key={index}>{user.username}</span>)}
              </Link>
            </div>
          </div>
          <div className="blog-detail__right">
            <div className="blog-detail__add-date">Created: {this.formatDate(this.state.blog.add_date)}</div>
            <div className="blog-detail__update-date">Last modified: {this.formatDate(this.state.blog.update_date)}</div>
            <div className="blog-detail__seen">Views: {this.state.blog.views}</div>
            {this.renderActions()}
          </div>
        </div>
        <div className="blog-detail__content">
          {this.state.elements.map((elem: Element, id: number) => {
            return elem.type === ElementType.PARAGRAPH
              ? <div className="blog-detail__p" key={id}>{elem.value as string}</div>
              : <img key={id} src={elem.value as string} alt={elem.value as string} className="blog-detail__image" />
          })}
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: ReduxState) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    notifySuccess: (msg: string) => dispatch(notifySuccess(msg))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Entry));
