import React, { Component, PropTypes } from 'react';
import ComponentStore from '../../helpers/componentStore';
import AutoComplete from '../AutoComplete.jsx';
import Button from '../Button.jsx';
import { httpInterceptor } from '../../helpers/httpInterceptor';

export default class MedicationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { color: 'red' };
    this.getDrugs = this.getDrugs.bind(this);
    this.onDrugSelect = this.onDrugSelect.bind(this);
  }

  onDrugSelect(value) {
    if (value && value.uuid) {
      this.setState({ color: 'blue', value });
    } else {
      this.setState({ color: 'red', value });
    }
  }

  getDrugs(input) {
    const optionsUrl = '/openmrs/ws/rest/v1/drug';
    const params = {
      v: 'custom:(uuid,strength,name,dosageForm,concept:(uuid,name,names:(name)))',
      s: 'ordered',
      q: input,
    };
    if (this.props.conceptSet) {
      params.q = this.props.conceptSet;
      params.s = 'byConceptSet';
    }
    return httpInterceptor.get(optionsUrl, params)
            .then((data) => {
              const options = data.results;
              return { options };
            }).catch(() => {
              const options = [];
              return { options };
            });
  }

  render() {
    let minimumInput = 0;
    if (!this.props.isDropDown) {
      minimumInput = 2;
    }


    return (
        <div>
          <AutoComplete
            loadOptions={this.getDrugs}
            minimumInput={minimumInput}
            onValueChange={this.onDrugSelect}
            placeholder="Search for drug to add to prescription"
            searchable={!this.props.isDropDown}
          />
          <Button color={this.state.color} label="Add to prescription" />
        </div>);
  }
}

MedicationContainer.propTypes = {
  conceptSet: PropTypes.string,
  isDropDown: PropTypes.bool,
};

MedicationContainer.defaultProps = {
  conceptSet: null,
  isDropDown: false,
};

ComponentStore.registerComponent('MedicationContainer', MedicationContainer);
