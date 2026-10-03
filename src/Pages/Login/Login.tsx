import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { useAppDispatch } from "../../hooks/store.hooks";
import { login } from "../../Store/slices/auth";
import {
  signInWithCognito,
  type CognitoLoginResponse,
  type CognitoNewPasswordChallenge,
} from "../../services/cognitoAuth";

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
  const [challenge, setChallenge] =
    useState<CognitoNewPasswordChallenge | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as LoginLocationState | null)?.from?.pathname ||
    "/character";

  const finishSignIn = (result: CognitoLoginResponse) => {
    setPassword("");
    setNewPassword("");
    setConfirmation("");
    setChallenge(null);
    dispatch(login({ playerName: result.email, token: result.token }));
    navigate(from, { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !email.trim() || !password) return;
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await signInWithCognito(email.trim(), password);

      setPassword("");
      if (result.kind === "new-password-required") {
        setChallenge(result);
      } else {
        finishSignIn(result);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in with those details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challenge || isSubmitting) return;
    if (newPassword !== confirmation) {
      setErrorMessage("Your passwords do not match.");
      return;
    }
    if (
      newPassword.length < 10 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setErrorMessage(
        "Use at least 10 characters, including an uppercase letter, a lowercase letter, and a number.",
      );
      return;
    }
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      finishSignIn(await challenge.complete(newPassword, attributes));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to set your password. Please try again.";
      setErrorMessage(
        /invalid session|session.*expired/i.test(message)
          ? "Your sign-in session has expired. Return to sign-in and use your invitation password again."
          : message,
      );
      setNewPassword("");
      setConfirmation("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartSignIn = () => {
    setChallenge(null);
    setPassword("");
    setNewPassword("");
    setConfirmation("");
    setAttributes({});
    setErrorMessage("");
  };

  return (
    <Stack
      component="section"
      className="campaign-login"
      direction="column"
      sx={{ gap: 6 }}
    >
      <span className="eyebrow">Luxtria / Your character</span>
      <Typography variant="h2" sx={{ textAlign: "center" }}>
        {challenge ? "Make this chapter yours." : "Open your next chapter."}
      </Typography>
      <Box
        component="form"
        onSubmit={challenge ? handleNewPassword : handleSubmit}
        aria-label={challenge ? "Set your password" : "Sign in"}
      >
        <Stack direction="column" sx={{ gap: 3 }}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          {challenge ? (
            <>
              <Typography component="p">
                Welcome. Choose a password for {challenge.email} to finish
                setting up your account.
              </Typography>
              <TextField
                key="new-password"
                label="New password"
                type="password"
                autoComplete="new-password"
                autoFocus
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                helperText="At least 10 characters, with an uppercase letter, a lowercase letter, and a number."
                required
                disabled={isSubmitting}
              />
              <TextField
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                required
                disabled={isSubmitting}
              />
              {challenge.requiredAttributes.map((name) => (
                <TextField
                  key={name}
                  label={name.replace(/^custom:/, "").replace(/_/g, " ")}
                  type={
                    name === "email"
                      ? "email"
                      : name === "phone_number"
                        ? "tel"
                        : "text"
                  }
                  value={attributes[name] || ""}
                  onChange={(event) =>
                    setAttributes((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting}
                />
              ))}
            </>
          ) : (
            <>
              <TextField
                label="Email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isSubmitting}
              />
              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </>
          )}
          <Button
            startIcon={<LoginIcon />}
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {challenge
              ? isSubmitting
                ? "Setting your password…"
                : "Set password and continue"
              : isSubmitting
                ? "Signing in…"
                : "Sign in"}
          </Button>
          {challenge && (
            <Button
              type="button"
              onClick={restartSignIn}
              disabled={isSubmitting}
            >
              Return to sign-in
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
