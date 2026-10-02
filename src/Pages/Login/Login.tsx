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
    (location.state as LoginLocationState | null)?.from?.pathname || "/character";

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
    <Stack component="section" className="campaign-login" direction="column" sx={{ gap: 6 }}>
      <span className="eyebrow">Luxtria / Your character</span>
      <Typography variant="h2" sx={{ textAlign: "center" }}>
        Open your next chapter.
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack direction="column" sx={{ gap: 3 }}>
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
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
