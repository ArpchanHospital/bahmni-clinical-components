import React, { Component, PropTypes } from 'react';
import { ComponentStore } from 'bahmni-form-controls';
import AutoComplete from 'src/components/AutoComplete.jsx';
import { httpInterceptor } from 'src/helpers/httpInterceptor';
import { urlConstants } from 'src/constants';
import Button from 'src/components/Button.jsx';
import DrugTable from 'src/components/medication/DrugTable.jsx'
import NewPrescriptionModal from 'src/components/medication/NewPrescriptionModal.jsx';
import NewPrescribedDrugTable from 'src/components/medication/NewPrescribedDrugTable.jsx'

export default class MedicationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { drugHistoryData: [], color: 'red', showModal: false, newPrescribedDrugs: [] };
    this.getDrugs = this.getDrugs.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onDrugSelect = this.onDrugSelect.bind(this);
    this.addNewDrug = this.addNewDrug.bind(this);
  }

  componentDidMount() {
    const allDrugHistory = `${urlConstants.allDrugHistory}${this.props.patientUuid}`;
    return httpInterceptor.get(allDrugHistory)
      .then((data) => this.setState({ drugHistoryData: data }))
      .catch(() => {
        const options = [];
        return { options };
      });
  }

  onDrugSelect(value) {
    if (value && value.uuid) {
      this.setState({ color: 'blue', value, showModal: true });
    } else {
      this.setState({ color: 'red', value });
    }
  }

  getDrugs(input) {
    const optionsUrl = urlConstants.drugOptionUrl;
    const params = {
      v: 'custom:(uuid,strength,name,dosageForm,concept:(uuid,name,names:(name)))',
      s: 'ordered',
      q: input,
    };
    if (this.props.drugConceptSet) {
      params.q = this.props.drugConceptSet;
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

  handleCloseModal() {
    this.setState({ showModal: false, value: null, color: 'red' });
  }

  addNewDrug(drug){
    var drugList = this.state.newPrescribedDrugs||[];
    drugList.push(drug);
    this.setState({newPrescribedDrugs:drugList, showModal: false, value: null, color: 'red' });
  }

  render() {
    let minimumInput = 0;
    if (!this.props.isDropDown) {
      minimumInput = 2;
      return (
        <div>
          <AutoComplete
            loadOptions={this.getDrugs}
            minimumInput={minimumInput}
            onValueChange={this.onDrugSelect}
            placeholder="Search for drug to add to prescription"
            searchable={!(this.props.isDropDown && this.props.drugConceptSet)}
            value={this.state.value}
          />
          <Button color={this.state.color} label="Add to prescription" />
          { this.state.showModal && <NewPrescriptionModal drug={this.state.value}
                                                          handleCloseModal={this.handleCloseModal} handleDone={this.addNewDrug}
                                                          treatmentConfig={this.props.treatmentConfig}
          /> }

          <NewPrescribedDrugTable drugOrderList={this.state.newPrescribedDrugs}  />
          <DrugTable data={this.state.drugHistoryData} />

        </div>);
    }


  }
}

MedicationContainer.propTypes = {
  patientUuid: PropTypes.string.isRequired,
  drugConceptSet: PropTypes.string,
  isDropDown: PropTypes.bool,
  treatmentConfig: PropTypes.object.isRequired,
};

MedicationContainer.defaultProps = {
  drugConceptSet: null,
  isDropDown: false,
};

ComponentStore.registerComponent('MedicationContainer', MedicationContainer);
