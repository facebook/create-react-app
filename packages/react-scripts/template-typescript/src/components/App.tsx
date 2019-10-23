import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import "../styles/app.scss";
import { ApplicationState } from "../store";
import { AppMode, CoordinateOption } from "../store/App";
import { actionCreators, Actions } from "../store/App/actions";
import { connect } from "react-redux";
import { Select } from 'antd';
import { bindActionCreators } from "redux";

interface Props extends RouteComponentProps<{}, {}> {
    body?: React.ReactElement<any>;
    mode?: AppMode;
    showExportElevationModal?: boolean;
    availableCoordinates?: CoordinateOption[];
    actions?: Actions;
    expandLayers?: boolean;
}

class App extends React.PureComponent<Props, {}> 
{
    constructor(props)
    {
        super(props);
    }
    public componentDidMount() {
    }

    public render()
    {
        return (
            <div className="main">
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationState) =>
{
    return {
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        ...actionCreators,
    }, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));