import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Navbar from "../Components/Molecule/Navbar/Navbar";
import Draw from "../Components/Molecule/Draw/Draw";
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
        <Stack direction={"column"}>
          <Box sx={{ position: "fixed", zIndex: 100, left: 0 }}>
            <Navbar onMenuButtonClick={NavbarProps.onMenuButtonClick} />
          </Box>
          <Box sx={{ mt: 30 }}>{children}</Box>
        </Stack>
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
