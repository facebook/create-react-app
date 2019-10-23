
import * as React from 'react';
import styles from '../../../styles/pages/home/index.module.scss';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { ApplicationState } from '../../../store';
import { bindActionCreators } from 'redux';

interface Props extends RouteComponentProps
{
}

class Home extends React.Component<Props, {}> 
{

    public render()
    {
        return (
            <div className={`${styles.homepage}` }>Hello World</div>
        );
    }
}

const mapStateToProps = (state: ApplicationState)  =>
{
    return {
    }
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
    }, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));