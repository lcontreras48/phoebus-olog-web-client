/**
 * Copyright (C) 2019 European Spallation Source ERIC.
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
import { FaPaperclip, FaReply } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { updateCurrentLogEntry } from 'features/currentLogEntryReducer';
import { formatFullDateTime, getLogEntryGroupId } from 'utils';
import { useNavigate } from "react-router-dom";

const LogInfoContainer = styled.li`
    
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.25rem;

    &:hover {
        background-color: rgba(0, 0, 0, 0.10);
        cursor: pointer;
    }


    ${({selected}) => selected ? `
        background-color: #c8e0f4;
        border-left: 2px solid #333;
        padding-left: 0.5rem;
    ` : ''}

    transition: padding 100ms ease;

`

const LogInfo = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
`

const HeaderInfo = styled(LogInfo)`
    gap: 0.5rem;

    h3, & {
        font-size: 1rem;
        font-weight: normal;
    }
`

const SearchResultItem = ({log, currentLogEntry}) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isGroupEntry = getLogEntryGroupId(log.properties);

    const formatDescription = (description) => {
        let length = 75;
        if(!description){
            return "";
        }
        let ellipsis = description.length > length ? "..." : "";
        return description.substring(0, length) + ellipsis;
    }

    const handleClick = () => {
        dispatch(updateCurrentLogEntry(log));
        navigate(`/logs/${log.id}`);
    }

    return (
        <LogInfoContainer 
            grouped={getLogEntryGroupId(log.properties) !== null} 
            selected={currentLogEntry && currentLogEntry.id === log.id}
            onClick={handleClick}
            isGroupEntry={isGroupEntry}
        >
            <HeaderInfo>
                <h3>{log.title}</h3>
                <HeaderInfo>
                    <p>{isGroupEntry ? <FaReply/> : null}</p>
                    <p>{log.attachments && log.attachments.length  !== 0 ? <FaPaperclip/> : null}</p>
                </HeaderInfo>
            </HeaderInfo>
            <LogInfo>
                <p>{log.owner}</p>
                <p>{formatFullDateTime(log.createdDate)}</p>
            </LogInfo>
            <LogInfo>
                <p>{formatDescription(log.description)}</p>
                <p>{log.id}</p>
            </LogInfo>
        </LogInfoContainer>
    )
    
}

export default SearchResultItem;