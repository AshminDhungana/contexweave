import { useState } from 'react';
import { apiService } from '../services/api';
import { useAppStore } from '../store/appStore';

// Validation rules
const RULES = {
  title: {
    minLength: 1,
    maxLength: 255,
  },
  description: {
    maxLength: 2000,
  },
};

// Validation function
const validateForm = (data) => {
  const errors = {};

  // Title validation
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Title is required';
  } else if (data.title.length > RULES.title.maxLength) {
    errors.title = `Title must be ${RULES.title.maxLength} characters or less`;
  }

  // Description validation
  if (data.description && data.description.length > RULES.description.maxLength) {
    errors.description = `Description must be ${RULES.description.maxLength} characters or less`;
  }

  return errors;
};

export default function CreateDecisionForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const { addDecision } = useAppStore();

  // Real-time validation as user types
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!value.trim()) {
        newErrors.title = 'Title is required';
      } else if (value.length > RULES.title.maxLength) {
        newErrors.title = `Title must be ${RULES.title.maxLength} characters or less`;
      } else {
        delete newErrors.title;
      }
      return newErrors;
    });
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (value.length > RULES.description.maxLength) {
        newErrors.description = `Description must be ${RULES.description.maxLength} characters or less`;
      } else {
        delete newErrors.description;
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Validate form
    const formErrors = validateForm({ title, description });
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      const decision = await apiService.createDecision(title, description);
      addDecision(decision);
      
      // Success feedback
      setSubmitSuccess(`Decision "${decision.title}" created successfully!`);
      setTitle('');
      setDescription('');
      setErrors({});

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (error) {
      // Better error handling
      const errorMsg = error.response?.data?.detail?.[0]?.msg 
        || error.response?.data?.message 
        || 'Failed to create decision. Please try again.';
      setSubmitError(errorMsg);
      console.error('Failed to create decision:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = title.trim() && Object.keys(errors).length === 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">New Decision</h2>
      
      {/* Error Toast */}
      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ❌ {submitError}
        </div>
      )}

      {/* Success Toast */}
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✅ {submitSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${title.length > RULES.title.maxLength ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {title.length}/{RULES.title.maxLength}
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter decision title..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
              errors.title
                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span> {errors.title}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <span className={`text-xs ${description.length > RULES.description.maxLength ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {description.length}/{RULES.description.maxLength}
            </span>
          </div>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter decision description..."
            rows="4"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
              errors.description
                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span> {errors.description}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full px-4 py-2 rounded-lg font-medium transition ${
            isFormValid && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            'Create Decision'
          )}
        </button>
      </form>
    </div>
  );
}
