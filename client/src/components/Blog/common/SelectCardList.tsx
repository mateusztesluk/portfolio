import React from 'react';
import { Link } from 'react-router-dom';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import './SelectCardList.scss';
import ButtonWidget from 'shared/components/widgets/button/button';
import SelectWidget from 'shared/components/widgets/select/select';

import { getConfigRoutesBlog } from 'config';
import { Blog } from 'shared/interfaces/blog';
import HttpService from 'shared/services/HttpService'
import BlogService from 'shared/services/blog.service';


interface Props {
    endpoint: string;
    filters: {[filterName: string]: string | null};
    selector?: string;
    initData?: any[];
};

interface Subject {
    id: number;
    name?: string;
}

interface Entity {
  subject: any;
  blogs: Blog[];
}

interface State {
  loading: boolean;
  subjects: any[];
  selectedEntity: Entity[];
}


class SelectCardList extends React.Component<Props, State> {
  private _httpService: HttpService = new HttpService();
  private _service: BlogService = new BlogService();
  state = {
    subjects: [],
    selectedEntity: [],
    loading: false,
  };

  componentDidMount() {
    this.setState({
      loading: true,
    });
    const initData = this.props.initData;
    if (initData) {
      const subjects: Subject[] = this.mapSubjects(initData, this.props.selector)
      subjects.forEach((subject: Subject) => this.getBlogs(subject));
    }
    this.getSubjects()
  }

  getSubjects() {
    const url = this.props.endpoint;
    const selector = this.props.selector;
    this._httpService.get(url).then(response => {
      const subjects: Subject[] = this.mapSubjects(response, selector)
      this.setState({
        subjects: subjects,
        loading: false,
      });
    }).catch(error => {
    })
  }

  mapSubjects(subjects: any, selector: string | undefined) {
    return (subjects || [])
      .filter((subject: Subject | string | undefined | null) => subject !== undefined && subject !== null)
      .map((subject: Subject | string, index: number) => {
        if (typeof subject === 'string') {
          return {id: index, name: subject};
        }

        return {
          id: subject.id ?? index,
          name: selector ? (subject as any)[selector] : (subject as any).name
        };
      });
  }

  getBlogs(subject: Subject) {
    const subjectBlogsExists = this.state.selectedEntity.map((entity: Entity) => entity.subject.id).includes(subject.id);
    if (!subjectBlogsExists) {
      const filters = {};
      for (const key in this.props.filters) {
        filters[key] = this.props.filters[key] === 'id' ? subject.id : subject.name;
      }
      this._service.getActivatedBlogs(filters).then((response: Blog[]) => {
        const entity: Entity = {subject, blogs: response};
        const selectedEntity: Entity[] = [...this.state.selectedEntity, entity];
        this.setState({
          selectedEntity,
        });
      }).catch(error => {
      })
    }
    this.setState({
      loading: false,
    });
  }

  handleSubjectSelectChange(id: number) {
    this.setState({
      loading: true,
    });
    const subject: Subject = this.state.subjects.find((subject: Subject) => id === subject.id) || {id};
    this.getBlogs(subject);
  }

  handleRemoveSubjectBlogs(index: number) {
    const selectedEntity: Entity[] = [...this.state.selectedEntity];
    selectedEntity.splice(index, 1);
    this.setState({
      selectedEntity,
    });
  }

  renderBlogsCard(keyId: number, subject: Subject, blogs: Blog[]) {
    return (
      <Card className="blog-cards__card" key={keyId}>
        <CardContent>
          <header className="blog-cards__blogs-header">{subject.name || subject.id}</header>
          {blogs.map(blog => {
            return (
              <Link to={getConfigRoutesBlog('detail')(blog.id)} className="blog-cards__blogs-list-element" key={blog.id}>
                <ArrowRightIcon fontSize="inherit" />
                <div className="blog-cards__blogs-list-element-text">{blog.title}</div>
              </Link>
            )
          })}
        </CardContent>
        <CardActions>
          <ButtonWidget onClick={() => this.handleRemoveSubjectBlogs(keyId)} text={'Unpin'}/>
        </CardActions>
      </Card>
    )
  }

  renderMainCard() {
    return (
      <Card className="blog-cards__card--header">
        <CardContent>
          {this.state.loading && <LinearProgress />}
          <SelectWidget data={this.state.subjects} onChange={(id: string | number) => this.handleSubjectSelectChange(id as number)}/>
        </CardContent>
      </Card>
    )
  }

  render() {
    return (
      <div className="blog-cards">
        <div className="blog-cards__header">
          {this.renderMainCard()}
        </div>
        <div className="blog-cards__list">
          {this.state.selectedEntity.map((entity: Entity, index: number) => this.renderBlogsCard(index, entity.subject, entity.blogs))}
        </div>

      </div>
    );
  }
};

export default SelectCardList;