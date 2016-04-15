import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import WorkspaceDropdown from './dropdowns/WorkspaceDropdown'
import RequestActionsDropdown from './dropdowns/RequestActionsDropdown'
import RequestGroupActionsDropdown from './dropdowns/RequestGroupActionsDropdown'
import DebouncingInput from './base/DebouncingInput'
import MethodTag from './MethodTag'

class Sidebar extends Component {
  onFilterChange (value) {
    this.props.changeFilter(value);
  }

  renderRequestGroupRow (requestGroup) {
    const {
      activeFilter,
      activeRequest,
      addRequest,
      toggleRequestGroup,
      requests,
      requestGroups
    } = this.props;

    let filteredRequests = requests.filter(
      r => {
        // TODO: Move this to a lib file

        if (!activeFilter) {
          return true;
        }

        const toMatch = `${r.method} ::: ${r.name}`.toLowerCase();
        const matchTokens = activeFilter.toLowerCase().split(' ');
        for (let i = 0; i < matchTokens.length; i++) {
          if (toMatch.indexOf(matchTokens[i]) === -1) {
            return false;
          }
        }

        return true;
      }
    );

    if (!requestGroup) {
      // Grab all requests that are not children of request groups
      // TODO: Optimize this
      filteredRequests = filteredRequests.filter(r => {
        return !requestGroups.find(rg => {
          return rg.children.find(c => c.id === r.id)
        })
      });

      return filteredRequests.map(request => this.renderRequestRow(request));
    }

    // Grab all of the children for this request group
    filteredRequests = filteredRequests.filter(
      r => requestGroup.children.find(c => c.id === r.id)
    );

    // Don't show folder if it was not in the filter
    if (activeFilter && !filteredRequests.length) {
      return null;
    }

    const isActive = activeRequest && filteredRequests.find(r => r.id == activeRequest.id);

    let folderIconClass = 'fa-folder';
    let expanded = !requestGroup.collapsed || activeFilter;
    folderIconClass += !expanded ? '' : '-open';
    folderIconClass += isActive ? '' : '-o';

    const sidebarItemClassNames = classnames(
      'sidebar__item',
      'sidebar__item--bordered',
      {'sidebar__item--active': isActive}
    );

    return (
      <li key={requestGroup.id}>
        <div className={sidebarItemClassNames}>
          <div className="sidebar__item__row">
            <button onClick={e => toggleRequestGroup(requestGroup.id)}>
              <i className={'fa ' + folderIconClass}></i>
              &nbsp;&nbsp;&nbsp;{requestGroup.name}
            </button>
          </div>
          <div className="sidebar__item__btn grid">
            <button onClick={(e) => addRequest(requestGroup.id)}>
              <i className="fa fa-plus-circle"></i>
            </button>
            <RequestGroupActionsDropdown
              requestGroup={requestGroup}
              right={true}
              className="tall"/>
          </div>
        </div>
        <ul>
          {expanded && !filteredRequests.length ? this.renderRequestRow() : null}
          {!expanded ? null : filteredRequests.map(request => this.renderRequestRow(request, requestGroup))}
        </ul>
      </li>
    );
  }

  renderRequestRow (request = null, requestGroup = null) {
    const {activeRequest, activateRequest} = this.props;
    const isActive = request && activeRequest && request.id === activeRequest.id;

    return (
      <li key={request ? request.id : 'none'}>
        <div className={'sidebar__item ' + (isActive ? 'sidebar__item--active' : '')}>
          <div className="sidebar__item__row">
            {request ? (
              <button onClick={() => {activateRequest(request.id)}}>
                <MethodTag method={request.method}/> {request.name}
              </button>
            ) : (
              <button className="italic">No Requests</button>
            )}
          </div>
          {request ? (
            <RequestActionsDropdown
              className="sidebar__item__btn"
              right={true}
              request={request}
              requestGroup={requestGroup}
            />
          ) : null}
        </div>
      </li>
    );
  }

  render () {
    const {activeFilter, requestGroups} = this.props;

    return (
      <aside className="sidebar bg-dark grid--v">
        <header className="header">
          <WorkspaceDropdown />
        </header>
        <div className="grid--v grid--start grid__cell">
          <ul
            className="grid--v grid--start grid__cell sidebar__scroll hover-scrollbars sidebar__request-list">
            {this.renderRequestGroupRow(null)}
            {requestGroups.map(requestGroup => this.renderRequestGroupRow(requestGroup))}
          </ul>
          <div className="form-control form-control--underlined">
            <DebouncingInput
              type="text"
              placeholder="Filter Requests"
              debounceMillis={300}
              value={activeFilter}
              onChange={this.onFilterChange.bind(this)}/>
          </div>
        </div>
      </aside>
    )
  }
}

Sidebar.propTypes = {
  activateRequest: PropTypes.func.isRequired,
  addRequest: PropTypes.func.isRequired,
  changeFilter: PropTypes.func.isRequired,
  toggleRequestGroup: PropTypes.func.isRequired,
  deleteRequestGroup: PropTypes.func.isRequired,
  updateRequestGroup: PropTypes.func.isRequired,
  activeFilter: PropTypes.string,
  requests: PropTypes.array.isRequired,
  requestGroups: PropTypes.array.isRequired,
  activeRequest: PropTypes.object
};

export default Sidebar;
