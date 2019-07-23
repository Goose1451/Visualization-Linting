import ReactDOM from 'react-dom';
import React from 'react';
import debounce from 'lodash.debounce';
import './main.css';

// it appears that no-unused-vars has a bug :( TODO AMC to report
/* eslint-disable no-unused-vars */
import ChartPreview from './components/chart-preview';
import ControlHeader from './components/control-header';
import CodeEditor from './components/code-editor';
import LogoHeader from './components/logo-header';
import LintReport from './components/lint-report';
/* eslint-enable no-unused-vars */
import {BAD_CHARTS} from '../../test/vega-examples';

import {getRendering, lintSpec, classnames} from './utils';

class App extends React.Component {
  constructor() {
    super();
    const currentSpec = BAD_CHARTS[Object.keys(BAD_CHARTS)[0]];
    this.state = {
      currentSpec,
      currentCode: JSON.stringify(currentSpec, null, 2),
      height: 0,
      width: 0,
      lintingTarget: null,
      lintLoading: false,
      renderLoading: false,
      JSONerror: false
    };
    this.setAsyncState = this.setAsyncState.bind(this);
    this.lintSpec = this.lintSpec.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', debounce(this.resize.bind(this), 50));
    this.resize();
    this.renderSpec(this.state.currentSpec);
    this.lintSpec(this.state.currentSpec);
  }

  setAsyncState(newState) {
    return new Promise((resolve) => this.setState(newState, () => resolve()));
  }

  resize() {
    const currentNode = ReactDOM.findDOMNode(this.refs.mainContainer);
    this.setState({
      height: currentNode.clientHeight,
      width: currentNode.clientWidth
    });
  }

  renderSpec(currentSpec) {
    this.setAsyncState({renderLoading: true, lintingTarget: null})
      .then(() => getRendering(currentSpec))
      .then(lintingTarget => this.setState({lintingTarget, renderLoading: false}));
  }

  lintSpec(currentSpec) {
    this.setAsyncState({lintLoading: true, lintResults: null})
      .then(() => lintSpec(currentSpec))
      .then(lintResults => this.setState({lintResults, lintLoading: false}));
  }

  render() {
    const {
      currentSpec,
      currentCode,
      height,
      lintingTarget,
      lintLoading,
      lintResults,
      renderLoading,
      width
    } = this.state;

    // this function encapsulates the logic for error handling the set state
    // for the code editor, TODO maybe reconfigure to be a hook
    const changeSpec = triggerRelint => newValue => {
      const newCode = newValue;
      this.setAsyncState({currentCode: newCode})
      .then(() => {
        return new Promise((resolve, reject) => resolve(JSON.parse(newCode)))
        .then(code => this.setAsyncState({
          currentSpec: code,
          JSONerror: null
        }))
        .catch(e => this.setAsyncState({
          JSONerror: e
        }));
      })
      .then(() => {
        if (!this.state.JSONerror && triggerRelint) {
          this.renderSpec(this.state.currentSpec);
          this.lintSpec(this.state.currentSpec);
        }
      });
    };

    return (
      <div className="flex-down full-height full-width" ref="mainContainer">
        <LogoHeader />
        <ControlHeader
          buildChart={() => this.renderSpec(currentSpec)}
          executeSpec={() => {
            this.renderSpec(currentSpec);
            this.lintSpec(currentSpec);
          }}
          changeSpec={changeSpec(true)}
          currentSpec={currentSpec}/>
        <div className="flex margin-top-20 full-width">
          <div className="flex-down relative">
            <div
              className={classnames({
                'flex-down': true,
                'error-message': true,
                'show-error-message': this.state.JSONerror
              })}>JSON ERROR</div>
            <CodeEditor
              height={height - 128 - 20}
              width={width / 3}
              changeSpec={changeSpec(false)}
              currentCode={currentCode}/>
        </div>
          <div className="flex-down full-width">
            <ChartPreview
              loading={renderLoading}
              lintingTarget={lintingTarget}/>
            <LintReport
              loading={lintLoading}
              lintResults={lintResults}/>
          </div>
        </div>
      </div>
    );
  }
}

const el = document.createElement('div');
el.setAttribute('class', 'full-height');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
