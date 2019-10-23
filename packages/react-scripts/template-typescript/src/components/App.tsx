import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import "../styles/app.scss";
import { ApplicationState } from "../store";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

interface Props extends RouteComponentProps<{}, {}> {
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
    }, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));