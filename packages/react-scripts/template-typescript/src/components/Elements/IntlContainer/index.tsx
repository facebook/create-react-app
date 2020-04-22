import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { IAppState } from "../../../store/index";
import { IntlProvider } from "react-intl";
import { getLocales, ILocales } from "../../../intl/index";

interface ConnectedProps
{
	locale: ILocales;
}

export class IntlContainer extends React.PureComponent<ConnectedProps, {}> {
	public render()
	{
		return (
			<div>
				<IntlProvider
					locale={this.props.locale}
					messages={getLocales(this.props.locale)}
					// tslint:disable-next-line jsx-no-lambda
					onError={(err) =>
					{
						// react-intl itself doesn't inherently have any locale-data. Ignore Error
						console.warn(err)
					}}
				>
					{this.props.children}
				</IntlProvider>
			</div>
		);
	}
}

const mapStateToProps = (state: IAppState) =>
{
	return {
		locale: state.application.locale,
	};
};

const mapActionsToProps = dispatch =>
{
	return {
		actions: bindActionCreators(
			{},
			dispatch
		),
	};
};

export default connect(
	mapStateToProps,
	mapActionsToProps
)(IntlContainer);
