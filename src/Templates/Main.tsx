import { Container, Grid } from "@mui/material";
import Navbar from "Components/Molecule/Navbar/Navbar";
import Draw from "Components/Molecule/Draw/Draw";
import { ReactNode } from "react";

export interface IMainTemplateProps {
  children: ReactNode;
  NavbarProps: {
    onMenuButtonClick: () => void;
  };
  DrawProps: {
    open: boolean;
    closeModal: () => void;
    openSingleModal: () => void;
  };
}

export default function MainTemplate({
  NavbarProps,
  DrawProps,
  children,
}: IMainTemplateProps) {
  return (
    <>
      <Container maxWidth="lg">
        <Grid container direction={"column"}>
          <Grid item sx={{ position: "fixed", zIndex: 100, left: 0 }}>
            <Navbar onMenuButtonClick={NavbarProps.onMenuButtonClick} />
          </Grid>
          <Grid item sx={{ mt: 30 }}>
            {children}
          </Grid>
        </Grid>
      </Container>
      <div>
        <Draw
          open={DrawProps.open}
          closeModal={DrawProps.closeModal}
          openSingleModal={DrawProps.openSingleModal}
        />
      </div>
    </>
  );
}
