import React from "react";
import {Link} from 'react-router-dom';
import { Box, Divider, Stack } from "@mui/material";
import Banner1 from "../../assets/ebsbanner2023.png";
import BannerDetails1 from "../../assets/ebsBanner2023Details.pdf";


export function Banner() {
    return (
        <React.Fragment>
            <br />
            <Stack spacing={2} alignItems="center" justifyContent="center">
                <Stack
                    direction="row"
                    divider={
                        <Divider
                            orientation="vertical"
                            variant="middle"
                            flexItem
                        />
                    }
                    spacing={2}
                >
                    <Link to={BannerDetails1}>
                        <img
                        src={Banner1}
                        alt="example"
                        />
                    </Link>
                </Stack>
            </Stack>
            <br />
        </React.Fragment>
    );
    
}
