import React, { PureComponent, Component } from 'react';
import { compose } from 'redux'
import styled from 'styled-components'
import { Progress, ModalHeader } from 'reactstrap'
import PropTypes from 'prop-types';

import { MSG } from '../../../../../constants'

import { withIntl } from '../../../../../components/IntlProvider';
import { calculatePercentage } from '../../../../../utils';

class ProcessingContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            percent: 0,
            timeouts: []
        }
        this.setPercent = this.setPercent.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState){
            if (this.state.process &&
                !this.state.process.status
            ) {
                return false
            }

            return true
    }

    componentWillUpdate(nextProps, nextState) {
        if (!nextProps.process.status) {
            this.state.timeouts.forEach((timeout) => {
                clearTimeout(timeout);
            });
        }
    }

    setPercent (total, i) {
        const timeouts = this.state.timeouts;
        timeouts.push(setTimeout(() => {
            const percent = calculatePercentage(total, i);
            this.setState({
                percent: percent < 90 ? percent : 95,
            })
        }, 50 * i));
        this.setState({
            timeouts: timeouts
        })
    }

    componentDidMount() {
        const {
            process,
        } = this.props

        if (process.status && process.total > 0 && process.screen === 'sending') {
            const total = (process.total * (process.total < 2 ? 4 : 6)); // 4 seconds per tx
            for (let i = 1; i < total; i++) {
                this.setPercent(total, i);
            }
        }
    }
    
    render () {
        const {
            intl: { formatMessage },
        } = this.props

        return (
            <Wrapper>
                <ModalHeader>{formatMessage(MSG.MY_WALLET_POPUP_PROCESSING_SEND_TOKEN_TITLE)}</ModalHeader>
                <Description>Main mode allows you to make the transactions which are ingconitive and couldn’t be traceable</Description>
                <StyledProgress color="yellow" value={this.state.percent} />
            </Wrapper>
        )
    }
}
// ===== PROP TYPES =====
ProcessingContent.propTypes = {
    /** Processing props */
    process: PropTypes.object,
    updateProcess: PropTypes.func,
};
ProcessingContent.defaultProps = {
    process: {},
    updateProcess: () => {},
}

export default compose(withIntl)(ProcessingContent);

const Wrapper = styled.div.attrs({
    className: 'text-center',
})`
    padding-left: 20px;
    padding-right: 20px;
`

const StyledProgress = styled(Progress)`
    height: 12px;
    border-radius: 10px;
    background-color: #F1F5FF;

    .progress-bar.bg-yellow {
        background-color: #E4AE63;
    }
`

const Description = styled.div`
    margin-top: 12px;
    margin-bottom: 65px;
    color: ${props => props.theme.color};
`