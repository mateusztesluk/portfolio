import React from 'react';
import { connect } from 'react-redux';

import './BlogForm.scss';
import ButtonWidget from 'shared/components/widgets/button/button';
import SelectFileWidget from 'shared/components/widgets/selectFile/selectFile';

import { notifySuccess } from 'actions/notify';
import { Blog, Element, ElementType, BlogFormData } from 'shared/interfaces/blog';
import { getConfigUrlSrvCountires } from 'config';
import BlogService from 'shared/services/blog.service';
import SelectMultipleWidget from 'shared/components/widgets/selectMult/selectMult';
import InputWidget from 'shared/components/widgets/input/input';
import { withRouter } from 'shared/router/withRouter';


interface ComponentState {
  elements: Element[];
  title: string;
  countries: string[];
}

interface ReduxProps {
  notifySuccess: (msg: string) => void;
}

interface Props {
  initData: BlogFormData;
  history: any;
  match: any;
}

class BlogForm extends React.Component <ReduxProps & Props, ComponentState> {
  _service: BlogService = new BlogService();
  state = {
    elements: [{value: '', type: ElementType.PARAGRAPH}],
    title: '',
    countries: [],
  };

  componentDidUpdate(prevProps: ReduxProps & Props) {
    if (prevProps.initData &&
      (prevProps.initData.elements !== this.props.initData.elements ||
        prevProps.initData.title !== this.props.initData.title ||
        prevProps.initData.countries !== this.props.initData.countries)
        ) {
        this.setState({
            elements: this.props.initData.elements,
            title: this.props.initData.title,
            countries: this.props.initData.countries
        });
    }
  }

  clearState() {
    this.setState({
      elements: [{value: '', type: ElementType.PARAGRAPH}],
      title: '',
      countries: []
    });
  }

  postBlog(data: BlogFormData) {
    this._service.postBlog(data).then((response: Blog) => {
      this.clearState();
      this.props.notifySuccess('Blog successfully created. Please wait for administration verification!');
      this.props.history.push('/blog/' + response.id);
    }).catch(err => {});
  }

  updateBlog(data: BlogFormData) {
    this._service.putBlog(this.props.match.params.id, data).then((response: Blog) => {
      this.clearState();
      this.props.notifySuccess('Blog successfully updated');
      this.props.history.push('/blog/' + response.id);
    }).catch(err => {});
  }

  addNewParagraph(e: any, id: number) {
    this.addElement(ElementType.PARAGRAPH, id);
  }

  addNewImage(e: any, id: number) {
    this.addElement(ElementType.IMAGE, id);
  }

  addElement(type: ElementType, id: number) {
    const array: Element[] = [...this.state.elements];
    array.splice(id+1, 0, {value: '', type: type});
    this.setState({
      elements: [...array]
    });
  }

  removeElement(e: any, id: number) {
    const array: Element[] = [...this.state.elements];
    array.splice(id, 1);
    this.setState({
      elements: [...array]
    });
  }

  onParagraphValueChange(e: any, i: number) {
    const array: Element[] = [...this.state.elements];
    array[i].value = e.target.value;
    this.setState({
      elements: array
    });
  }

  onFileChange(file: File, i: number) {
    const array: Element[] = [...this.state.elements];
    array[i].value = file;
    this.setState({
      elements: array
    });
  }

  onTitleChange(value: string) {
    this.setState({title: value});
  }

  onCountriesChange(value: (string | number)[]) {
    const countries = value.map(country => String(country));
    const countriesChanged =
      countries.length !== this.state.countries.length ||
      countries.some((country, index) => country !== this.state.countries[index]);

    if (countriesChanged) {
      this.setState({countries});
    }
  }

  handleCountriesChange = (countries: (string | number)[]) => {
    this.onCountriesChange(countries);
  }

  onSubmit(event: any) {
    event.preventDefault();
    const data = {
      elements: this.state.elements,
      countries: this.state.countries,
      title: this.state.title,
    };
    this.props.initData ? this.updateBlog(data) : this.postBlog(data);
  }

  renderSelectImage(file: File | string, i: number) {
    return (
      <SelectFileWidget name="blog-image" onChange={(file) => this.onFileChange(file, i)} orderNumber={i} initialValue={file ? file as string : null}/>
    )
  }

  renderParagraph(value: string, id: number) {
    return (
      <div className="blog-form__paragraph" key={id}>
        <textarea
          className="blog-form__control blog-form__textarea"
          placeholder="Type..."
          rows={5}
          value={value}
          onChange={(e) => this.onParagraphValueChange(e, id)}
        />
      </div>
    )
  }

  renderPartForm(elem: Element, id: number) {
    return (
      <div className="blog-form__part-form" key={id}>
        {elem.type === ElementType.PARAGRAPH ? this.renderParagraph(elem.value as string, id) : this.renderSelectImage(elem.value as File, id)}
        {this.renderToolAction(id)}
      </div>
    )
  }

  renderToolAction(id: number) {
    let removeButton = <div></ div>;
    const isDeletable = id === 0 && this.state.elements.length > 0;
    if (!isDeletable) {
      removeButton = <ButtonWidget onClick={(e) => this.removeElement(e, id)} text="Remove"/>
    }

    return (
      <div className="blog-form__tool-action">
        <ButtonWidget onClick={(e) => this.addNewParagraph(e, id)} text="Add here paragrapgh"/>
        <ButtonWidget onClick={(e) => this.addNewImage(e, id)} text="Add here image"/>
        {removeButton}
      </div>
    )
  }

  renderSettings() {
    const titleInitialValue = this.props.initData ? this.props.initData.title : undefined;
    const countriesInitialValue = this.props.initData ? this.props.initData.countries : undefined;

    return (
      <div className="blog-form__settings">
        <InputWidget placeholder="Title" onChange={(value: string) => this.onTitleChange(value)} initialValue={titleInitialValue}/>
        <SelectMultipleWidget placeholder="Pick region" onChange={this.handleCountriesChange} endpoint={getConfigUrlSrvCountires()} initialValue={countriesInitialValue}/>
      </div>
    )
  }

  render() {
    return (
      <div className="blog-form">
        <form className="blog-form__form" onSubmit={(e) => this.onSubmit(e)}>
          { this.renderSettings() }
          { this.state.elements.map((elem: Element, id: number) => this.renderPartForm(elem, id)) }
          <ButtonWidget type="submit" text={'Submit'}/>
        </form>
      </div>
    );
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    notifySuccess: (msg: string) => dispatch(notifySuccess(msg))
  };
};

export default withRouter(connect<{}, {}, any>(null, mapDispatchToProps)(BlogForm));
