import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import './select.scss';

import HttpService from 'shared/services/HttpService';
import { SelectedEntity } from 'shared/interfaces/select';


interface State {
  selected: number | string;
  data: SelectedEntity[];
}

interface Props {
  onChange?: (value: number | string) => void;
  data?: SelectedEntity[];
  endpoint?: string;
  placeholder?: string;
  changeValue?: boolean;
}

class SelectWidget extends React.Component<Props, State> {
  private _httpService: HttpService = new HttpService();
  state = {
    selected: -1,
    data: [],
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.data !== state.data && !props.endpoint) {
      return {
        data: props.data,
      };
    }

    return null;
  }

  componentDidMount() {
    const url = this.props.endpoint;
    if (url) this.getData(url);
  }


  getData(url: string | null) {
    if (url) {
      this._httpService.get(url).then(response => {
        this.setState({
          data: response || [],
        });
      }).catch(err => {});
    }
  }

  handleSelectChange(event: any) {
    const value: number | string = Number(event.target.value) || event.target.value;
    if (this.props.onChange) this.props.onChange(value);
    this.setState({
      selected: value,
    });
  }

  render() {
    return (
      <div className="widget-select">
        <div className="widget-select__control">
          <select
            className="widget-select__select"
            value={this.props.changeValue ? this.state.selected : -1}
            onChange={(e) => this.handleSelectChange(e)}
          >
            <option
              value={-1}
              disabled>{this.props.placeholder || "Pick"}
            </option>
            {this.state.data.map((entity: SelectedEntity, index: number) => <option key={entity.id || index} value={entity.id || entity.name}>{entity.name}</option>)}
          </select>
          <ExpandMoreIcon className="widget-select__icon" />
        </div>
      </div>
    )
  }
}

export default SelectWidget;