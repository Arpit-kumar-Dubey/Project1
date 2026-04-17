import AppliedJob from '../models/ApplyModel.js';
import Candidate from '../models/candidateModel.js';
import PostedJob from '../models/postedModel.js';
import Recruiter from '../models/recruiterModel.js';
import SavedJob from '../models/savedModel.js';

// Redirect helper with toast params
const toast = (res, url, message, type = 'info') => {
    const encoded = encodeURIComponent(message);
    return res.redirect(`${url}?msg=${encoded}&type=${type}`);
};

// Redirect back with toast
const toastBack = (res, req, message, type = 'error') => {
    const ref = req.get('Referer') || '/';
    const encoded = encodeURIComponent(message);
    const sep = ref.includes('?') ? '&' : '?';
    return res.redirect(`${ref}${sep}msg=${encoded}&type=${type}`);
};

export const getJobs = async (req, res) => {
    try {
        const data = await PostedJob.find();
        res.render('recuiter_postedJob', { data });
    } catch (error) {
        console.error('getJobs error:', error);
        return toast(res, '/Rdashboard', 'Error fetching jobs', 'error');
    }
};

export const postJob = async (req, res) => {
    try {
        if (!req.session.email) {
            return toast(res, '/recruiter/login', 'Session expired. Please login again.', 'warning');
        }
        const newJ = {
            ...req.body,
            RecruiterId: req.session.email,
            postedDate: new Date().toISOString().split('T')[0]
        };
        await PostedJob.create(newJ);
        return toast(res, '/Rdashboard', 'Job posted successfully! 🎉', 'success');
    } catch (error) {
        console.error('postJob error:', error);
        return toast(res, '/recruiter/post-job', 'Error posting job. Try again.', 'error');
    }
};

export const Applicants = async (req, resp) => {
    try {
        if (!req.session.email) {
            return toast(resp, '/recruiter/login', 'Session expired. Please login again.', 'warning');
        }
        const email = req.session.email;
        const data = await AppliedJob.find({ RecruiterId: email });
        resp.render('recuiter_viewApplicant', { data });
    } catch (error) {
        console.error('Applicants error:', error);
        return toast(resp, '/Rdashboard', 'Error fetching applicants', 'error');
    }
};

export const savedJobs = async (req, resp) => {
    try {
        const email = req.session.userId;
        if (!email) return toast(resp, '/candidate/login', 'Session expired. Please login.', 'warning');
        const data = await SavedJob.find({ candidate: email });
        if (!data || data.length === 0) return toast(resp, '/dashboard', 'No saved jobs found', 'info');
        resp.render('candidate_savedJobs', { data });
    } catch (error) {
        console.error('savedJobs error:', error);
        return toast(resp, '/dashboard', 'Error fetching saved jobs', 'error');
    }
};

export const EditPostedJob = async (req, resp) => {
    try {
        if (!req.session.email) {
            return toast(resp, '/recruiter/login', 'Session expired. Please login again.', 'warning');
        }
        const id = req.params.id;
        const result2 = await PostedJob.findById(id);
        if (!result2) {
            return toast(resp, '/Rdashboard', 'Job not found', 'error');
        }
        resp.render('recruiter_updateJob', { result: result2 });
    } catch (error) {
        console.error('EditPostedJob error:', error);
        return toast(resp, '/Rdashboard', 'Error loading job editor', 'error');
    }
};

export const view = async (req, resp) => {
    try {
        const id = req.params.id;
        const job = await PostedJob.findById(id);
        if (!job) {
            return toast(resp, '/Rdashboard', 'Job not found', 'error');
        }
        resp.render('viewpostedJob', { job });
    } catch (error) {
        console.error('view error:', error);
        return toast(resp, '/Rdashboard', 'Error loading job details', 'error');
    }
};

export const viewPosted = async (req, resp) => {
    try {
        if (!req.session.email) {
            return toast(resp, '/recruiter/login', 'Session expired. Please login again.', 'warning');
        }
        const email = req.session.email;
        const data = await PostedJob.find({ RecruiterId: email });
        if (!data || data.length === 0) {
            return toast(resp, '/Rdashboard', 'You have no posted jobs yet.', 'info');
        }
        resp.render('recuiter_postedJob', { data });
    } catch (error) {
        console.error('viewPosted error:', error);
        return toast(resp, '/Rdashboard', 'Error loading posted jobs', 'error');
    }
};

export const aplyed = async (req, resp) => {
    try {
        const email = req.session.userId;
        if (!email) return toast(resp, '/candidate/login', 'Session expired. Please login.', 'warning');
        const data = await AppliedJob.find({ candidate: email });
        if (!data || data.length === 0) return toast(resp, '/dashboard', 'No applications found', 'info');
        resp.render('candidate_viewJobs', { data });
    } catch (error) {
        console.error('aplyed error:', error);
        return toast(resp, '/dashboard', 'Error loading applications', 'error');
    }
};

export const profile = async (req, resp) => {
    try {
        const email = req.session.userId;
        if (!email) return toast(resp, '/candidate/login', 'Session expired. Please login.', 'warning');
        const user = await Candidate.findOne({ email });
        if (!user) return toast(resp, '/candidate/login', 'Profile not found. Please login.', 'warning');
        resp.render('candidate_profile', { candidate: user });
    } catch (error) {
        console.error('profile error:', error);
        return toast(resp, '/dashboard', 'Error loading profile', 'error');
    }
};

export const CandidateUpdate = async (req, resp) => {
    try {
        const id = req.session.candidateId;
        if (!id) return toast(resp, '/candidate/login', 'Session expired. Please login.', 'warning');
        await Candidate.findByIdAndUpdate(id, { $set: req.body });
        return toast(resp, '/candidate/profile', 'Profile updated successfully! ✅', 'success');
    } catch (error) {
        console.error('CandidateUpdate error:', error);
        return toast(resp, '/candidate/profile', 'Error updating profile', 'error');
    }
};

export const cDashboard = async (req, resp) => {
    try {
        const email = req.session.userId;
        if (!email) return toast(resp, '/candidate/login', 'Please login to continue.', 'warning');

        const data1       = await AppliedJob.find({ candidate: email });
        const applycount  = await AppliedJob.countDocuments({ candidate: email });
        const savecount   = await SavedJob.countDocuments({ candidate: email });
        const user        = await Candidate.findOne({ email });
        const jobs        = await PostedJob.find();

        resp.render('candidate_dashboard', {
            jobs,
            name: user.name,
            applyed: applycount,
            save: savecount,
            apply: data1
        });
    } catch (error) {
        console.error('cDashboard error:', error);
        return toast(resp, '/candidate/login', 'Dashboard error. Please login again.', 'error');
    }
};

export const filter = async (req, resp) => {
    try {
        const { title } = req.body;
        if (!title) return resp.redirect('/dashboard');

        const email      = req.session.userId;
        const data1      = await AppliedJob.find({ candidate: email });
        const applycount = await AppliedJob.countDocuments({ candidate: email });
        const savecount  = await SavedJob.countDocuments({ candidate: email });
        const user       = await Candidate.findOne({ email });
        const jobs       = await PostedJob.find({ title: { $regex: title, $options: 'i' } });

        resp.render('candidate_dashboard', { jobs, name: user.name, applyed: applycount, save: savecount, apply: data1 });
    } catch (error) {
        console.error('filter error:', error);
        return toast(resp, '/dashboard', 'Filter error. Try again.', 'error');
    }
};

export const apply = async (req, resp) => {
    try {
        const email = req.session.userId;
        if (!email) return toast(resp, '/candidate/login', 'Please login to apply for jobs.', 'warning');

        const user      = await Candidate.findOne({ email });
        const jobResult = await PostedJob.findById(req.params.id);
        if (!jobResult) return toast(resp, '/dashboard', 'Job not found', 'error');

        const find = await AppliedJob.findOne({ jobId: req.params.id, candidate: email });
        if (find) return toast(resp, '/dashboard', 'You have already applied for this job', 'info');

        const applicationData = {
            ...jobResult._doc,
            candidate: email,
            jobId: req.params.id,
            status: 'pending',
            name: user.name,
            locationCandidate: user.location || 'Not updated',
            appliedAt: new Date().toISOString().split('T')[0]
        };
        delete applicationData._id;

        await AppliedJob.create(applicationData);
        return toast(resp, '/dashboard', 'Applied successfully! Good luck 🍀', 'success');
    } catch (error) {
        console.error('apply error:', error);
        return toast(resp, '/dashboard', 'Error applying for job. Try again.', 'error');
    }
};

export const saveJob = async (req, resp) => {
    try {
        const email = req.session.userId;
        if (!email) return toast(resp, '/candidate/login', 'Please login to save jobs.', 'warning');

        const jobResult = await PostedJob.findById(req.params.id);
        if (!jobResult) return toast(resp, '/dashboard', 'Job not found', 'error');

        const find = await SavedJob.findOne({ jobId: req.params.id, candidate: email });
        if (find) return toast(resp, '/dashboard', 'Job already saved!', 'info');

        const saveData = { ...jobResult._doc, candidate: email, jobId: req.params.id };
        delete saveData._id;

        await SavedJob.create(saveData);
        return toast(resp, '/dashboard', 'Job saved successfully! ❤️', 'success');
    } catch (error) {
        console.error('saveJob error:', error);
        return toast(resp, '/dashboard', 'Error saving job. Try again.', 'error');
    }
};

export const Rdashboard = async (req, resp) => {
    try {
        const email = req.session.email;
        if (!email) return toast(resp, '/recruiter/login', 'Session expired. Please login again.', 'warning');

        const applicants     = await AppliedJob.find({ RecruiterId: email });
        const countPosted    = await PostedJob.countDocuments({ RecruiterId: email });
        const countApplicants = await AppliedJob.countDocuments({ RecruiterId: email });
        const job            = await PostedJob.find({ RecruiterId: email });
        const user           = await Recruiter.findOne({ email });

        resp.render('recuiter_dashboard', {
            name: user.name,
            job,
            user1: applicants,
            Applicants: countApplicants,
            posted: countPosted
        });
    } catch (error) {
        console.error('Rdashboard error:', error);
        return toast(resp, '/recruiter/login', 'Dashboard error. Please login again.', 'error');
    }
};

export const deleteApply = async (req, resp) => {
    try {
        await AppliedJob.findByIdAndDelete(req.params.id);
        return toast(resp, '/3', 'Application deleted successfully', 'success');
    } catch (err) {
        console.error('deleteApply error:', err);
        return toast(resp, '/3', 'Error deleting application', 'error');
    }
};

export const deleteSaved = async (req, resp) => {
    try {
        await SavedJob.findByIdAndDelete(req.params.id);
        return toast(resp, '/savedJobs', 'Saved job removed', 'success');
    } catch (err) {
        console.error('deleteSaved error:', err);
        return toast(resp, '/savedJobs', 'Error deleting saved job', 'error');
    }
};

export const deletePostedJob = async (req, resp) => {
    try {
        const id = req.params.id;
        await SavedJob.deleteMany({ jobId: id });
        await AppliedJob.deleteMany({ jobId: id });
        await PostedJob.findByIdAndDelete(id);
        return toast(resp, '/Rdashboard', 'Job deleted successfully', 'success');
    } catch (err) {
        console.error('deletePostedJob error:', err);
        return toast(resp, '/Rdashboard', 'Error deleting job', 'error');
    }
};

export const updateJob = async (req, resp) => {
    try {
        if (!req.session.email) return toast(resp, '/recruiter/login', 'Session expired. Please login.', 'warning');
        const { id } = req.body;
        await PostedJob.findByIdAndUpdate(id, { $set: req.body });
        return toast(resp, '/Rdashboard', 'Job updated successfully! ✅', 'success');
    } catch (error) {
        console.error('updateJob error:', error);
        return toast(resp, '/Rdashboard', 'Error updating job', 'error');
    }
};

export const Accept = async (req, resp) => {
    try {
        await AppliedJob.findByIdAndUpdate(req.params.id, { status: 'Accepted' });
        return toast(resp, '/Rdashboard', 'Candidate accepted! ✅', 'success');
    } catch (err) {
        console.error('Accept error:', err);
        return toast(resp, '/Rdashboard', 'Error accepting candidate', 'error');
    }
};

export const Reject = async (req, resp) => {
    try {
        await AppliedJob.findByIdAndUpdate(req.params.id, { status: 'Rejected' });
        return toast(resp, '/Rdashboard', 'Candidate rejected', 'info');
    } catch (err) {
        console.error('Reject error:', err);
        return toast(resp, '/Rdashboard', 'Error rejecting candidate', 'error');
    }
};

export const viewCandidate = async (req, resp) => {
    try {
        const { Email, idJob } = req.body;
        const user = await Candidate.findOne({ email: Email });
        resp.render('viewCandidateProfile', { user, idJob });
    } catch (error) {
        console.error('viewCandidate error:', error);
        return toast(resp, '/Rdashboard', 'Error loading candidate profile', 'error');
    }
};
