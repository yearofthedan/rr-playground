import React, {Component} from 'react';
import {render} from 'react-dom';
import $ from 'jquery';
import _ from 'underscore';
import ParticipantsList from './ParticipantsList.jsx';
import AdminHeader from './AdminHeader.jsx';
import GroupsList from './GroupsList.jsx';
import GroupDetailView from './GroupDetailView.jsx';
import ErrorView from './ErrorView.jsx';
import labService from '../../services/labService.js';
import groupService from '../../services/groupService.js';

export default class AdminDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            participants: [],
            groups: [],
            labs: [],
            selectedGroup: undefined,
            currentLab: '',
            filteredParticipantList: [],
            pageErrors: [],
            onSaveGroup: (groupDetails) => {
                this.clearErrors();
                groupService.createOrUpdateGroup(groupDetails, this.state.currentLab.id)
                .then( (savedGroup) => {
                    this.addGroup(this.state.groups, savedGroup);
                })
                .catch(this.handleError.bind(this));
            },
            onSelectGroup: (selected) => {
                this.clearErrors();
                this.updateGroupSelection(selected);
                this.setGroupFilter(selected);
            },
            onDeleteGroup: (selected) => {
                this.clearErrors();
                groupService.deleteGroup(selected, this.state.currentLab.id)
                .then(()=> {
                    this.setState({groups: this.findAndRemoveGroup(this.state.groups, selected)});
                    this.setGroupFilter();
                })
                .catch(this.handleError.bind(this));
            }
        };
    }

    clearErrors() {
        this.setState({pageErrors: []});
    }

    handleError(error) {
        let pageErrors = this.state.pageErrors.slice(0);
        pageErrors.push(error.message);
        this.setState({pageErrors: pageErrors});

    }

    updateGroupSelection(selected) {
        let groups = this.state.groups.map(group => {
            return Object.assign({}, group, { selected: selected !== undefined && group.id === selected.id });
        });
        this.setState({groups: groups});
    }

    addGroup(groups, group) {
        let newGroups = groups.slice(0);
        let oldGroup = newGroups.find (g => g.id === group.id);
        if(oldGroup) {
            Object.assign(oldGroup, group);
        }
        else {
            newGroups.push(group);
        }
        this.setState({groups: newGroups});
    }

    findAndRemoveGroup(groups, selected) {
        let group = groups.find(group => group.id === selected.id);
        return _.without(groups, group);
    }

    setGroupFilter(selected) {
        this.setState({selectedGroup: selected ? selected : undefined}, this.filterParticipantList);
    }

    componentDidMount() {
        labService.getMyLabs()
            .then( (labs) => {
                this.setState({labs: labs});
                this.setState({currentLab: labs[0]});
                labService.getLabPartipicants(this.state.currentLab.id)
                        .then( participants => { this.setState({participants: participants});
                                                 this.filterParticipantList();
                                                });
                labService.getLabGroups(this.state.currentLab.id)
                        .then( groups => { this.setState({groups: groups}); });
            });
    }

    filterParticipantList() {
        if (!this.state.selectedGroup) {
            this.setState({filteredParticipantList: this.state.participants});
        }
        else {
            this.setState({filteredParticipantList:
                    this.state.participants.filter( element => {
                        return element.Groups.filter( group => {
                            return group.id === this.state.selectedGroup.id;
                        }).length > 0;
                    })
            });
        }
    }

    render() {
        let detailsView = this.state.selectedGroup ? (<GroupDetailView selectedGroup={ this.state.selectedGroup }
                                                                onSave={ this.state.onSaveGroup }
                                                                onDelete={ this.state.onDeleteGroup } />) : '';
        let errorsView = this.state.pageErrors.length > 0 ? ( <ErrorView errors={ this.state.pageErrors } />) : '';
        return (
            <div className="admin-container">
                <div className="container">
                    <AdminHeader />
                    { errorsView }
                    <nav id="groups">
                        <GroupsList editable={ true } selectedGroup={this.state.selectedGroup} groups={ this.state.groups } onSave={ this.state.onSaveGroup } onSelectGroup={ this.state.onSelectGroup } />
                    </nav>
                    { detailsView }
                </div>
                <div className="container">
                    <ParticipantsList participants={ this.state.filteredParticipantList } groups={ this.state.groups }/>
                </div>
            </div>);
    }
}

render(<AdminDashboard />, document.getElementById('app'));
