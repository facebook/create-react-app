
import * as React from 'react';
import styles from '../../../styles/pages/home/index.module.scss';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IAppState } from '../../../store';
import { bindActionCreators } from 'redux';
import Message from '../../Elements/Message/index';

// tslint:disable-next-line no-empty-interface
interface Props extends RouteComponentProps
{
}

class Home extends React.Component<Props, {}>
{

	public render()
	{
		return (
			<div className={`${styles.homepage}`}>{Message('hello_world')}</div>
		);
	}
}

const mapStateToProps = (state: IAppState) =>
{
	return {
	}
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({
	}, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));