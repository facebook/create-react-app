import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import format from 'date-fns/format';
import { Link } from 'react-router';
import Icon from '../../components/commons/icon';
import Image from '../../components/commons/image';
import Button from '../../components/commons/button';

// Actions
import * as scheduleActions from '../../actions/schedule';
import * as playerActions from '../../actions/player';
import * as podcastsActions from '../../actions/podcasts';

// Selector
import { getContentType } from '../../reducers/utils';

import { createHTML } from '../../services/utils';

import { forcePodcastLoad, forcePodcastPlay } from '../../components/commons/podcast-player';
import { forceRadioPlay } from '../../components/commons/player';

// Assets
import headphoneIcon from '../../../images/sprite/btn-headphone-icon.svg';
import graphIcon from '../../../images/sprite/btn-graph-icon.svg';

class ScheduleSingle extends Component {
  componentWillMount() {
  }

  handleLivePlayerClick() {
    forceRadioPlay();
  }

  sendPodcastToPlayer(podcast) {
    this.props.setCurrentPodcastPlaying(podcast);
    this.props.togglePodcastPlay();
  }

  render() {
    const { schedule, isLoading } = this.props;

    if (!isLoading && schedule) {
      return (
        <div className="schedule__shows">
          <div className="container">
            {schedule.episodes.map(episode =>
              <div
                key={episode.id}
                className={classnames('schedule__show', {
                  'schedule__show--is-live': episode.is_live
                })}
              >
                <div className="schedule__show-info__inner-container">
                  { episode.is_live &&
                    <div className="schedule__show__on-air-status schedule__show__on-air-status--desktop">
                      <span className="schedule__show__status-bullet" />
                      <span className="schedule__show__status-label">On Air Now</span>
                    </div>
                  }
                  <span className="schedule__show-time schedule__show-time--desktop">{format(new Date(episode.start), 'hh:mm a')} - {format(new Date(episode.end), 'hh:mm a')}</span>
                </div>
                <div className="schedule__show-thumb-container">
                  <Link
                    to={`/family/${episode.show.id}`}
                    className="schedule__show-thumb-link"
                    activeClassName="schedule__show-thumb-link"
                  >
                    <Image
                      imgSrc={episode.show.image}
                      imgAlt={episode.show.title}
                      className="imgix-wrapper schedule__show-thumb ratio-schedule"
                      defaultWidth={163}
                      defaultHeight={215}
                      mobileWidth={76}
                      mobileHeight={100}
                      imgQuality={80}
                    />
                  </Link>
                </div>
                <div className="schedule__show-info">
                  <span className="schedule__show-time schedule__show-time--mobile">{format(new Date(episode.start), 'hh:mm a')} - {format(new Date(episode.end), 'hh:mm a')}</span>
                  <div className="schedule__description-container">
                    <Link
                      to={`/family/${episode.show.id}`}
                      className="schedule__show-thumb-link"
                      activeClassName="schedule__show-thumb-link"
                    >
                      <h2 className="schedule__show-title">{episode.show.title}</h2>
                    </Link>
                    { episode.is_live &&
                      <p
                        className="schedule__show-description"
                        dangerouslySetInnerHTML={createHTML(episode.description)}
                      />
                    }
                  </div>
                  { !episode.is_live && episode.media &&
                    <Button
                      onTouchStart={() => forcePodcastLoad(episode)}
                      onClick={() => forcePodcastPlay(episode)}
                      className="schedule__listen-back-btn schedule__listen-btn btn--light-bg"
                      color="black"
                      label="Listen Back"
                      small
                      internalRollOver
                    >
                      <Icon
                        glyph={headphoneIcon}
                        className="schedule__listen-back-btn__icon schedule__listen-btn__icon"
                      />
                    </Button>
                  }
                  { episode.is_live &&
                    <div className="schedule__show_on-air">
                      <div className="schedule__show__on-air-status schedule__show__on-air-status--mobile">
                        <span className="schedule__show__status-bullet" />
                        <span className="schedule__show__status-label">On Air Now</span>
                      </div>
                      <Button
                        onClick={this.handleLivePlayerClick.bind(this)}
                        className="schedule__listen-now-btn schedule__listen-btn"
                        color="red"
                        label="Listen Now"
                        small
                        internalRollOver
                      >
                        <Icon
                          glyph={graphIcon}
                          className="schedule__listen-now-btn__icon schedule__listen-btn__icon"
                        />
                      </Button>
                    </div>
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isLoading) {
      return null;
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col">
            No schedule yet!
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ player, schedule }, ownProps) {
  const date = ownProps.params.date || format(new Date(), 'YYYY-MM-DD');
  const weekSchedule = getContentType('list', schedule);
  let daySchedule;

  if (!weekSchedule.isLoading && weekSchedule.items) {
    daySchedule = weekSchedule.items
        .find(day => format(day.date, 'YYYY-MM-DD') === date)
      || weekSchedule.items[0];
  }

  return {
    ...player,
    schedule: daySchedule,
    isLoading: weekSchedule.isLoading
  };
}

const mapDispatchToProps = {
  ...scheduleActions,
  ...playerActions,
  ...podcastsActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleSingle);
