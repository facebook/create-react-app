import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import "../styles/app.scss";
import { IAppState } from "../store";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

interface Props extends RouteComponentProps<{}, {}>
{
}

class App extends React.PureComponent<Props, {}>
{
	public render()
	{
		return (
			<div className="main">
				{this.props.children}
			</div>
		);
	}
}

const mapStateToProps = (state: IAppState) =>
{
	return {
	};
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({
	}, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));