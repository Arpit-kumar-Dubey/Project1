import bcrypt from 'bcrypt';
import Candidate from '../models/candidateModel.js';
import Recruiter from '../models/recruiterModel.js';

// Helper: redirect with toast params
const toast = (res, url, message, type = 'info') => {
    const encoded = encodeURIComponent(message);
    return res.redirect(`${url}?msg=${encoded}&type=${type}`);
};

export const recruiterLogin = async (req, resp) => {
    try {
        const { email, password } = req.body;
        const user = await Recruiter.findOne({ email });
        if (!user) {
            return toast(resp, '/recruiter/login', 'Invalid email or password', 'error');
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return toast(resp, '/recruiter/login', 'Invalid email or password', 'error');
        }
        req.session.Rid = user._id;
        req.session.email = email;
        req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            return toast(resp, '/Rdashboard', 'Login successful! Welcome back 👋', 'success');
        });
    } catch (error) {
        console.error('recruiterLogin error:', error);
        return toast(resp, '/recruiter/login', 'Internal server error. Try again.', 'error');
    }
};

export const recruiterRegister = async (req, resp) => {
    try {
        const { name, email, password } = req.body;
        const existing = await Recruiter.findOne({ email });
        if (existing) {
            return toast(resp, '/recruiter/register', 'Account already exists. Please login.', 'warning');
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        await Recruiter.create({ name, email, password: hashed });
        return toast(resp, '/recruiter/login', 'Registration successful! Please login.', 'success');
    } catch (error) {
        console.error('recruiterRegister error:', error);
        return toast(resp, '/recruiter/register', 'Registration failed. Try again.', 'error');
    }
};

export const c_register = async (req, resp) => {
    try {
        const { name, email, password } = req.body;
        const existing = await Candidate.findOne({ email });
        if (existing) {
            return toast(resp, '/candidate/register', 'Account already exists. Please login.', 'warning');
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        await Candidate.create({ name, email, password: hashed });
        return toast(resp, '/candidate/login', 'Registration successful! Please login.', 'success');
    } catch (error) {
        console.error('c_register error:', error);
        return toast(resp, '/candidate/register', 'Registration failed. Try again.', 'error');
    }
};

export const candidateLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Candidate.findOne({ email });
        if (!user) {
            return toast(res, '/candidate/login', 'Invalid email or password', 'error');
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return toast(res, '/candidate/login', 'Invalid email or password', 'error');
        }
        req.session.userId = email;
        req.session.candidateId = user._id;
        req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            return toast(res, '/dashboard', 'Login successful! Welcome back 👋', 'success');
        });
    } catch (error) {
        console.error('candidateLogin error:', error);
        return toast(res, '/candidate/login', 'Internal server error. Try again.', 'error');
    }
};
