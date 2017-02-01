import React, {Component, PropTypes} from 'react';
import {httpInterceptor} from 'src/helpers/httpInterceptor';
import ReactModal from 'react-modal';
import Select from 'react-select';
import Measurement from 'src/components/Measurement.jsx';
import find from 'lodash/find';
import DrugStartDate from 'src/components/medication/DrugStartDate.jsx';


export default class NewPrescriptionModal extends Component {
  constructor(props) {
    super(props);
    var duration = {name: "duration"};
    var dose = {name: "dose"};
    var totalQuantity = {name: "totalQuantity"};
    var drugStartDate = new Date().toISOString().split("T")[0];

    this.state = {duration, dose, totalQuantity, drugStartDate};
    this.handleMeasurementChange = this.handleMeasurementChange.bind(this);
    this.handleTotalQuantityChange = this.handleTotalQuantityChange.bind(this);
    this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
    this.handleRouteChange = this.handleRouteChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.togglePRNStatus = this.togglePRNStatus.bind(this);
  }


  handleMeasurementChange(measurement) {
    var newState = {[measurement.name]: measurement};
    if (!this.state.totalQuantity.isManuallySet) {
      var totalQty = this.calculateTotalQuantity({[measurement.name]: measurement});
      newState.totalQuantity = totalQty
    }
    this.setState(newState);
  }

  handleTotalQuantityChange(measurement) {
    measurement.isManuallySet = true;
    this.setState({[measurement.name]: measurement});
  }

  handleRouteChange(route) {
    this.setState({route: route});
  }

  calculateTotalQuantity({dose = this.state.dose, duration = this.state.duration, frequency = this.state.frequency}) {
    var totalQty = this.state.totalQuantity;
    if (duration.value && dose.value && duration.unit && frequency) {
      totalQty.value = Math.ceil(duration.value * duration.unit.factor * dose.value *  frequency.frequencyPerDay);
      totalQty.unit = dose.unit;
    }
    return totalQty;
  }

  handleFrequencyChange(frequency) {
    var newState = {frequency: frequency};

    var duration = this.state.duration;
    duration.unit = this.getDurationUnitForFrequency(frequency) || duration.unit;
    newState.duration = duration;

    if (!this.state.totalQuantity.isManuallySet) {
      var totalQty = this.calculateTotalQuantity({duration:duration, frequency: frequency});
      newState.totalQuantity = totalQty;
    }
    this.setState(newState);
  }

  getDurationUnitForFrequency(frequency) {
    var durationUnitForFrequency = find(this.props.treatmentConfig.inputOptionsConfig.frequencyDefaultDurationUnitsMap, (range)=> {
      var minFrequency = this.getDecimalFromString(range.minFrequency);
      var maxFrequency = this.getDecimalFromString(range.maxFrequency);
      return frequency.frequencyPerDay > minFrequency && frequency.frequencyPerDay <= maxFrequency;
    });

    var durationUnit = find(this.props.treatmentConfig.durationUnits, (durationUnit) => {
      return durationUnitForFrequency && durationUnit.name === durationUnitForFrequency.defaultDurationUnit;
    });
    return durationUnit;
  }

  getDecimalFromString(input) {
    if(input && typeof input === 'number')
      return input;
    if (input && typeof input === 'string') {
      var a = input.split("/");
      return (a[0] / (a[1] || 1));
    }
  }


  handleDateChange(date) {
    this.setState({drugStartDate : date});
  }

  togglePRNStatus(){
    this.setState({PRNStatus: !this.state.PRNStatus });
  }

  render() {
    var styles = {
      overlay: {
        position: 'fixed',
        top: 100,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)'
      },
      content: {
        position: 'absolute',
        top: '48px',
        left: '74px',
        right: '40px',
        bottom: 'auto',
        border: '1px solid #ccc',
        background: '#fff',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px'

      }
    };
    return (<div>
        <ReactModal
          isOpen={true}
          contentLabel="onRequestClose Example"
          style={styles}>
          <p>{this.props.drug.name}</p>

          <Measurement onChange={this.handleMeasurementChange} options={this.props.treatmentConfig.durationUnits}
                       measurement={this.state.duration} label="Duration"/>

          <br/>
          <Measurement onChange={this.handleMeasurementChange} options={this.props.treatmentConfig.doseUnits}
                       measurement={this.state.dose} label="Dose"/>
          <br/>
          <Measurement onChange={this.handleTotalQuantityChange} options={this.props.treatmentConfig.doseUnits}
                       measurement={this.state.totalQuantity} label="Total Quantity"/>


          <p>Frequency</p>
          <Select options={this.props.treatmentConfig.frequencies} value={this.state.frequency} labelKey="name"
                  valueKey="name" onChange={this.handleFrequencyChange} searchable={false}/>
          <p>routes</p>
          <Select options={this.props.treatmentConfig.routes} value={this.state.route} labelKey="name" valueKey="name"
                  onChange={this.handleRouteChange} searchable={false}/>

          <DrugStartDate value={this.state.drugStartDate} onChange={this.handleDateChange}/>

          <p>PRN</p>
          <button onClick={this.togglePRNStatus}>PRN {this.state.PRNStatus}</button>

          <p>Additional Instructions</p>

          <button onClick={this.props.handleCloseModal}>Close</button>
        </ReactModal>
      </div>
    );

  }
}

NewPrescriptionModal.propTypes = {
  handleCloseModal: PropTypes.func,
  drug: PropTypes.object,
  treatmentConfig: PropTypes.object,
};
