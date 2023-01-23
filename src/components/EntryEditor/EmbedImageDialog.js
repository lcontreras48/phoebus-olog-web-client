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

import React, { useEffect } from 'react';
import Modal, {Header, Title, Body, Footer} from '../shared/Modal';
import { useForm } from 'react-hook-form';
import TextInput from 'components/shared/input/TextInput';
import FileInput from 'components/shared/input/FileInput';
import { useState } from 'react';
import Button from 'components/shared/Button';
import styled from 'styled-components';

const Form = styled.form`

`

const EmbedImageDialog = ({addEmbeddedImage, className}) => {

    const [show, setShow] = useState(false);

    const {control, setValue, watch, getValues} = useForm({
        mode: 'all',
        defaultValues: {imageWidth: 0, imageHeight: 0, scalingFactor: 1.0}
    });
    const [imageAttachment, setImageAttachment] = useState(null);
    const [originalImageWidth, setOriginalImageWidth] = useState(0);
    const [originalImageHeight, setOriginalImageHeight] = useState(0);
    const scalingFactor = watch('scalingFactor');
    
    const handleSubmit = (e) => {
        addEmbeddedImage(
            imageAttachment, 
            getValues('imageWidth'),
            getValues('imageHeight')
        );
        setShow(false);
    }

    const onFileChanged = (files) => {
        if(files){
            setImageAttachment(files[0]);
            checkImageSize(imageAttachment, setSize);
        }
    }

    const setSize = (w, h) => {
        setValue('scalingFactor', '1.0');
        setOriginalImageWidth(w);
        setOriginalImageHeight(h);
        setValue('imageWidth', w);
        setValue('imageHeight', h);
    }

    const checkImageSize = (image, setSize) => {
        //check whether browser fully supports all File API
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            const fr = new FileReader();
            fr.onload = function() { // file is loaded
                const img = new Image();
                img.onload = function() { // image is loaded; sizes are available
                    setSize(img.width || 0, img.height || 0);
                };
                img.src = fr.result; // is the data URL because called with readAsDataURL
            };
            fr.readAsDataURL(image);
        }
    }
    
    useEffect(() => {
        if(imageAttachment) {
            checkImageSize(imageAttachment, setSize)
        }
        // eslint-disable-next-line
    }, [imageAttachment])

    const scalingFactorIsValid = (value) => {
        return parseFloat(value) > 0 && parseFloat(value) <= 1;
    }

    const dimensionIsValid = (value) => {
        return parseInt(value) > 0;
    }

    useEffect(() => {
        const newImageWidth = Math.round(scalingFactor * originalImageWidth);
        const newImageHeight = Math.round(scalingFactor * originalImageHeight);
        setValue('imageWidth', newImageWidth);
        setValue('imageHeight', newImageHeight);
        // eslint-disable-next-line
    }, [scalingFactor]);
    
    return(
        <>
            <Button variant="secondary" 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShow(true);
                }}
                className={className}
            >
                Embed Image
            </Button>
            <Modal show={show} 
                onClose={() => setShow(false)}
            >
                <Form 
                    onSubmit={handleSubmit}
                >
                    <Header closeButton onClose={() => setShow(false)}>
                        <Title>Add Embedded Image</Title>
                    </Header>
                    <Body>
                        <FileInput 
                            label='Browse'
                            onFileChanged={onFileChanged}
                            multiple={false}
                            accept='image/*'
                        />
                        <TextInput 
                            name='scalingFactor'
                            label='Scaling Factor'
                            control={control}
                            defaultValue='1.0'
                            rules={{
                                validate: {
                                    isCorrectRange: val => scalingFactorIsValid(val) || 'Scaling factor must be between 0 and 1'
                                }
                            }}
                        />
                        <TextInput 
                            name='imageWidth'
                            label='Width'
                            control={control}
                            defaultValue='0.0'
                            rules={{
                                validate: {
                                    isPositive: val => dimensionIsValid(val) || 'Width must be a positive number'
                                }
                            }}
                        />
                        <TextInput 
                            name='imageHeight'
                            label='Height'
                            control={control}
                            defaultValue='0.0'
                            rules={{
                                validate: {
                                    isPositive: val => dimensionIsValid(val) || 'Height must be a positive number'
                                }
                            }}
                        />
                        
                    </Body>
                    <Footer>
                        <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                        <Button variant="primary" disabled={imageAttachment === null} onClick={handleSubmit}>OK</Button>
                    </Footer>
                </Form>
            </Modal>
        </>
    )
    
}

export default EmbedImageDialog;