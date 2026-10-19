const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a PDF resume." })
        }

        const { selfDescription, jobDescription } = req.body

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({ message: "Please provide the job description." })
        }

        let resumeText
        const parser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))

        try {
            const resumeContent = await parser.getText()
            resumeText = resumeContent.text
        } finally {
            await parser.destroy()
        }

        if (!resumeText || !resumeText.trim()) {
            return res.status(400).json({
                message: "No readable text found in the PDF. Please upload a text-based PDF."
            })
        }

        const aiReport = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...aiReport
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Interview report generation error:", error)
        return res.status(500).json({
            message: "Failed to generate the ATS report. Check the backend terminal."
        })
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const interviewReport = await interviewReportModel.findById(req.params.interviewId)

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Get report error:", error)
        return res.status(500).json({ message: "Failed to fetch interview report." })
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({})
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error("Get reports error:", error)
        return res.status(500).json({ message: "Failed to fetch interview reports." })
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params
        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const { resume, jobDescription, selfDescription } = interviewReport
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        return res.send(pdfBuffer)
    } catch (error) {
        console.error("Resume PDF generation error:", error)
        return res.status(500).json({ message: "Failed to generate resume PDF." })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}
