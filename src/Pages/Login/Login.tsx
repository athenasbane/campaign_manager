import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { useAppDispatch } from "../../hooks/store.hooks";
import { login } from "../../Store/slices/auth";
import { signInWithCognito } from "../../services/cognitoAuth";

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as LoginLocationState | null)?.from?.pathname || "/me";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await signInWithCognito(email.trim(), password);

      dispatch(
        login({
          playerName: result.email,
          token: result.token,
        })
      );
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in with those details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack component="main" direction="column" gap={3}>
      <Typography variant="h2" textAlign="center">
        Player Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack direction="column" gap={3}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button
            startIcon={<LoginIcon />}
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in" : "Login"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
