"use client"

import { FormEvent, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

const CURRENT_USER_ID = 1

const DEFAULT_THRESHOLDS = {
    isTooClose: 10,
    isNotSitting: 80,
}

type ThresholdFormState = {
    isTooClose: string
    isNotSitting: string
}

type StoredThresholds = {
    isTooClose: number
    isNotSitting: number
    savedAt?: string
}

type ThresholdErrors = Partial<Record<keyof ThresholdFormState, string>>

export default function SettingsPage() {
    const [formValues, setFormValues] = useState<ThresholdFormState>({
        isTooClose: DEFAULT_THRESHOLDS.isTooClose.toString(),
        isNotSitting: DEFAULT_THRESHOLDS.isNotSitting.toString(),
    })
    const [errors, setErrors] = useState<ThresholdErrors>({})
    const [feedback, setFeedback] = useState<
        | {
                type: "success" | "error"
                message: string
            }
        | null
    >(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isBootstrapping, setIsBootstrapping] = useState(true)
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        let isMounted = true

        const fetchThresholds = async () => {
            try {
                const response = await fetch(`/api/settings?user_id=${CURRENT_USER_ID}`)

                if (!response.ok) {
                    throw new Error("Failed to load thresholds")
                }

                const payload = await response.json()
                const data = payload.data as StoredThresholds | undefined
                const close = data?.isTooClose ?? DEFAULT_THRESHOLDS.isTooClose
                const away = data?.isNotSitting ?? DEFAULT_THRESHOLDS.isNotSitting

                if (!isMounted) return

                setFormValues({
                    isTooClose: close.toString(),
                    isNotSitting: away.toString(),
                })
                if (data?.savedAt) {
                    setLastSavedAt(new Date(data.savedAt))
                }
                setDirty(false)
            } catch (error) {
                console.error("Unable to load saved thresholds", error)
                if (!isMounted) return
                setFeedback({
                    type: "error",
                    message: "Unable to load your thresholds. Please refresh and try again.",
                })
            } finally {
                if (isMounted) {
                    setIsBootstrapping(false)
                }
            }
        }

        fetchThresholds()

        return () => {
            isMounted = false
        }
    }, [])

    const parseThresholds = () => {
        const parsed = {
            isTooClose: Number(formValues.isTooClose.trim()),
            isNotSitting: Number(formValues.isNotSitting.trim()),
        }

        return parsed
    }

    const validateThresholds = (values: ThresholdFormState) => {
        const nextErrors: ThresholdErrors = {}
        const tooClose = Number(values.isTooClose.trim())
        const notSitting = Number(values.isNotSitting.trim())

        if (!values.isTooClose.trim()) {
            nextErrors.isTooClose = "Enter the distance that triggers a too-close alert."
        } else if (Number.isNaN(tooClose)) {
            nextErrors.isTooClose = "Must be a number."
        } else if (tooClose <= 0) {
            nextErrors.isTooClose = "Use a value greater than zero."
        }

        if (!values.isNotSitting.trim()) {
            nextErrors.isNotSitting = "Enter the distance that marks you as away."
        } else if (Number.isNaN(notSitting)) {
            nextErrors.isNotSitting = "Must be a number."
        } else if (notSitting <= 0) {
            nextErrors.isNotSitting = "Use a value greater than zero."
        }

        if (Object.keys(nextErrors).length === 0 && tooClose >= notSitting) {
            nextErrors.isNotSitting =
                "Away detection should be higher than the too-close threshold."
        }

        return nextErrors
    }

    const handleInputChange = (
        field: keyof ThresholdFormState,
        value: string
    ) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }))
        setDirty(true)
        setErrors((prev) => ({ ...prev, [field]: undefined }))
        setFeedback(null)
    }

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFeedback(null)

        const nextErrors = validateThresholds(formValues)
        setErrors(nextErrors)

        if (Object.keys(nextErrors).length > 0) {
            setFeedback({
                type: "error",
                message: "Please resolve the highlighted fields before saving.",
            })
            return
        }

        const parsed = parseThresholds()

        setIsSaving(true)
        try {
            const response = await fetch(`/api/settings?user_id=${CURRENT_USER_ID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message ?? "Failed to save thresholds")
            }

            const payload = await response.json()
            const data = payload.data as StoredThresholds | undefined

            if (data) {
                setFormValues({
                    isTooClose: data.isTooClose.toString(),
                    isNotSitting: data.isNotSitting.toString(),
                })
                if (data.savedAt) {
                    setLastSavedAt(new Date(data.savedAt))
                }
            }

            setDirty(false)
            setFeedback({
                type: "success",
                message: "Thresholds updated. Your future readings will use these values.",
            })
        } catch (error) {
            console.error("Unable to save thresholds", error)
            setFeedback({
                type: "error",
                message: error instanceof Error ? error.message : "Something went wrong while saving.",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleReset = () => {
        setFormValues({
            isTooClose: DEFAULT_THRESHOLDS.isTooClose.toString(),
            isNotSitting: DEFAULT_THRESHOLDS.isNotSitting.toString(),
        })
        setErrors({})
        setDirty(true)
        setFeedback(null)
    }

    if (isBootstrapping) {
        return (
            <section className="flex min-h-[50vh] items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Spinner className="size-5" />
                    <span>Loading your settings…</span>
                </div>
            </section>
        )
    }

    return (
        <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-0">
            <header className="space-y-2">
                <p className="text-sm font-semibold text-primary">Posture preferences</p>
                <h1 className="text-3xl font-bold tracking-tight">Alert thresholds</h1>
                <p className="text-muted-foreground text-base">
                    Fine-tune when SitSmart alerts you.
                </p>
            </header>

            <form onSubmit={handleSave} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Distance-based alerts</CardTitle>
                        <CardDescription>
                            Set the range (in centimeters) that decides when you&apos;re too close
                            to the screen or no longer sitting. Keep the away threshold higher
                            than the too-close value.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div>
                            <label
                                htmlFor="too-close"
                                className="text-sm font-medium text-foreground"
                            >
                                Too-close alert
                            </label>
                            <div className="mt-2 flex items-center gap-3">
                                <input
                                    id="too-close"
                                    type="number"
                                    min={1}
                                    step={1}
                                    inputMode="decimal"
                                    value={formValues.isTooClose}
                                    onChange={(event) =>
                                        handleInputChange("isTooClose", event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.isTooClose)}
                                    aria-describedby="too-close-helper too-close-error"
                                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-base shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                />
                                <span className="text-sm text-muted-foreground">cm</span>
                            </div>
                            <p id="too-close-helper" className="mt-1 text-sm text-muted-foreground">
                                Recommended: between 8 cm and 20 cm depending on your setup.
                            </p>
                            {errors.isTooClose ? (
                                <p
                                    id="too-close-error"
                                    className="mt-1 text-sm font-medium text-destructive"
                                >
                                    {errors.isTooClose}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label
                                htmlFor="not-sitting"
                                className="text-sm font-medium text-foreground"
                            >
                                Away / not-sitting alert
                            </label>
                            <div className="mt-2 flex items-center gap-3">
                                <input
                                    id="not-sitting"
                                    type="number"
                                    min={1}
                                    step={1}
                                    inputMode="decimal"
                                    value={formValues.isNotSitting}
                                    onChange={(event) =>
                                        handleInputChange("isNotSitting", event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.isNotSitting)}
                                    aria-describedby="not-sitting-helper not-sitting-error"
                                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-base shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                />
                                <span className="text-sm text-muted-foreground">cm</span>
                            </div>
                            <p
                                id="not-sitting-helper"
                                className="mt-1 text-sm text-muted-foreground"
                            >
                                Recommended: between 70 cm and 120 cm, depending on how far
                                you walk away when leaving.
                            </p>
                            {errors.isNotSitting ? (
                                <p
                                    id="not-sitting-error"
                                    className="mt-1 text-sm font-medium text-destructive"
                                >
                                    {errors.isNotSitting}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-wrap gap-3">
                                    <Button type="submit" disabled={isSaving || !dirty}>
                            {isSaving ? (
                                <>
                                                <Spinner className="mr-2 size-4" /> Saving…
                                </>
                            ) : (
                                "Save changes"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={isSaving}
                        >
                            Reset to defaults
                        </Button>

                        <div className="ml-auto flex flex-col text-sm text-muted-foreground">
                            {lastSavedAt ? (
                                <span>Last saved {lastSavedAt.toLocaleString()}</span>
                            ) : (
                                <span>Not saved yet</span>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </form>

            {feedback ? (
                <p
                    role="status"
                    className={
                        feedback.type === "success"
                            ? "text-sm font-medium text-green-600"
                            : "text-sm font-medium text-destructive"
                    }
                >
                    {feedback.message}
                </p>
            ) : null}
        </section>
    )
}