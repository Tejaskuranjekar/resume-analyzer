import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)

        try {
            const response = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile
            })

            if (!response?.interviewReport?._id) {
                throw new Error("Report was not generated. Check the backend response.")
            }

            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error("Resume analysis error:", error?.response?.data || error)
            throw new Error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to generate ATS report."
            )
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (id) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error("Get report error:", error?.response?.data || error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.error("Get reports error:", error?.response?.data || error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(
                new Blob([response], { type: "application/pdf" })
            )
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Resume PDF error:", error?.response?.data || error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                if (interviewId) {
                    await getReportById(interviewId)
                } else {
                    await getReports()
                }
            } catch {
                // The original error is logged by the relevant function.
            }
        }

        loadData()
    }, [interviewId])

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }
}
