/**
 * Copyright (C) 2020 European Spallation Source ERIC.
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * <p>
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */

import {useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ologService from '../../api/olog-service';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LogDetails from '../LogDetails/LogDetails';
import SearchResultList from '../SearchResult/SearchResultList';
import customization from '../../utils/customization';
import { searchParamsToQueryString } from '../../utils/searchParams';
import { ologClientInfoHeader } from '../../utils/utils';
import { TaskTimer } from 'tasktimer';
import CollapsibleFilters from '../Filters/CollapsibleFilters';
import { useDispatch, useSelector } from 'react-redux';
import { updateSearchPageParams } from '../../features/searchPageParamsReducer';

const LogEntriesView = ({
    tags, 
    logbooks, 
    userData,
    setReplyAction, 
    showGroup, setShowGroup,
    currentLogEntry, setCurrentLogEntry
}) => {

    const timerRef = useRef(new TaskTimer(customization.defaultSearchFrequency));
    const [showFilters, setShowFilters] = useState(false);
    
    const dispatch = useDispatch();
    const searchParams = useSelector(state => state.searchParams);
    const searchPageParams = useSelector(state => state.searchPageParams);
    const [searchResults, setSearchResults] = useState({
        logs: [],
        hitCount: 0
    });
    const [searchInProgress, setSearchInProgress] = useState(false);
    const [logGroupRecords, setLogGroupRecords] = useState([]);

    const {id: logId } = useParams();

    const search = useCallback(() => {

        // perform the search
        const query = searchParamsToQueryString({...searchParams, ...searchPageParams});
        setSearchInProgress(true);

        ologService.get(`/logs/search?${query}`, {headers: ologClientInfoHeader()})
        .then(res => {
            if(res.data){
                setSearchResults(res.data);
                setCurrentLogEntry(res.data.logs[0]);
            }
        })
        .catch(err => {
            // If an error occurs, then reset the timer so it doesn't continue to bother the user
            timerRef.current.reset();

            // If there was no response at all, then we couldn't connect to the service
            if(!err.response) {
                alert("Unable to connect to service to perform search.");
            }

            // If the service responded, and it's a 400, then the query was invalid
            if(err.response && err.response.status === 400) {
                alert(`Server returned 'Bad Request' while performing search with query '${query}'`);
            }
        })
        .finally(() => {
            setSearchInProgress(false);
        })

        // eslint-disable-next-line
    }, [searchParams, searchPageParams, timerRef]);

    const triggerSearch = useCallback(() => {
        timerRef.current.reset();
        timerRef.current.add(() => search()).start();
        search();
    }, [timerRef, search]);

    // on initial render, add task to perform search periodically
    useEffect(() => {
        timerRef.current.add(search);
        timerRef.current.start();

        // Cleanup timer when component will unmount
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            timerRef.current.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // On changes to search or paging params, search and
    // reset the timers
    useEffect(() => {
        triggerSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchPageParams, triggerSearch]);

    // On changes to search params, reset the page to zero
    useEffect(() => {
        dispatch(updateSearchPageParams({...searchPageParams, from: 0}))
        // Ignore warning about missing dependency; we do *not* want
        // to update searchPageParams when searchPageParams changes...
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // if viewing a specific log entry, then retrieve it
    useEffect(() => {
        if(logId > 0) {
            ologService.get(`/logs/${logId}`)
            .then(res => {
                setCurrentLogEntry(res.data);
            })
            .catch(e => {
                console.error(`Could not find log id ${logId}`, e);
                setCurrentLogEntry(null);
            })
        }
    }, [logId, setCurrentLogEntry])

    const renderLogEntryDetails = () => {
        
        if(currentLogEntry) {
            return (
                <LogDetails {...{
                    showGroup, setShowGroup, 
                    currentLogEntry, setCurrentLogEntry, 
                    logGroupRecords, setLogGroupRecords, 
                    userData, 
                    setReplyAction,
                    searchResults
                }}/>
            );
        } else {
            if(logId) {
                return (
                    <h5>Log record id {logId} not found</h5>
                );
            } else {
                return (
                    <h5>Search for log entries, and select one to view</h5>
                );
            }
            
        }
    };

    return (
        <Container fluid className="h-100">
            <Row className="h-100">
                <CollapsibleFilters {...{
                    logbooks,
                    tags,
                    showFilters,
                    searchParams,
                    searchPageParams
                }}/>
                <Col xs={{span: '12', order: 2}} lg={{span: 4, order: 2}} className="h-100 p-1">
                    <SearchResultList {...{
                        searchParams,
                        searchPageParams,
                        searchResults,
                        searchInProgress,
                        currentLogEntry, setCurrentLogEntry,
                        showFilters, setShowFilters,
                        triggerSearch
                    }}/>
                </Col>
                <Col  
                    xs={{span: 12, order: 1}} 
                    lg={{span: showFilters ? 6 : 8, order: 3}} 
                    className="p-1"
                >
                    {renderLogEntryDetails()}
                </Col>
            </Row>
        </Container>
    );

}

export default LogEntriesView