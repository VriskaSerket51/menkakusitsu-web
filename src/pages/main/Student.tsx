import React, { useEffect } from "react";
import { Container } from "@mui/material";
import FixedNavbar from "../../components/navbar";
import {Banner, MealPanel, PagePanel, TimetablePanel } from "../../components";

function Student() {
    return (
        <React.Fragment>
            <Container
                maxWidth="xl"
                sx={{
                    margin: "30px auto 50px",
                }}
            >
                {/* <TimetablePanel /> */}
                {/* <br /> */}
                <MealPanel />
                <br />
                <Banner />
                <br />
            </Container>
        </React.Fragment>
    );
}

export default Student;
