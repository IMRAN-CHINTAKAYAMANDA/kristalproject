import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, Calendar, AlertTriangle } from 'lucide-react';
import { User } from '../App';
import { api, Assignment, Base, EquipmentType, Expenditure } from '../services/api';

interface AssignmentsProps {
  currentUser: User;
}

const Assignments: React.FC<AssignmentsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'expenditures'>('assignments');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [error, setError] = useState('');

  const [assignmentFormData, setAssignmentFormData] = useState({
    equipmentType: '',
    assetName: '',
    assetId: '',
    personnelId: '',
    personnelName: '',
    base: '',
    purpose: '',
    expectedReturnDate: '',
    notes: ''
  });

  const [expenditureFormData, setExpenditureFormData] = useState({
    equipmentType: '',
    assetName: '',
    quantity: '',
    expenditureDate: '',
    base: '',
    reason: '',
    reportingPersonnel: '',
    notes: ''
  });

  const loadRecords = () => {
    Promise.all([api.assignments(), api.expenditures()])
      .then(([assignmentRows, expenditureRows]) => {
        setAssignments(assignmentRows);
        setExpenditures(expenditureRows);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load records'));
  };

  useEffect(() => {
    loadRecords();
    api.meta()
      .then((meta) => {
        setBases(meta.bases);
        setEquipmentTypes(meta.equipmentTypes);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load filters'));
  }, []);

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.createAssignment({
        ...assignmentFormData,
        assignedTo: assignmentFormData.personnelName,
      });
      setShowAddForm(false);
      setAssignmentFormData({
        equipmentType: '',
        assetName: '',
        assetId: '',
        personnelId: '',
        personnelName: '',
        base: '',
        purpose: '',
        expectedReturnDate: '',
        notes: ''
      });
      loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record assignment');
    }
  };

  const handleExpenditureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.createExpenditure({
        ...expenditureFormData,
        date: expenditureFormData.expenditureDate,
        reportedBy: expenditureFormData.reportingPersonnel,
      });
      setShowAddForm(false);
      setExpenditureFormData({
        equipmentType: '',
        assetName: '',
        quantity: '',
        expenditureDate: '',
        base: '',
        reason: '',
        reportingPersonnel: '',
        notes: ''
      });
      loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record expenditure');
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpenditures = expenditures.filter(expenditure =>
    expenditure.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expenditure.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments & Expenditures</h1>
          <p className="text-gray-600 mt-1">Track asset assignments and usage for {currentUser.baseName || 'all bases'}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add {activeTab === 'assignments' ? 'Assignment' : 'Expenditure'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Asset Assignments</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expenditures')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenditures'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Asset Expenditures</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Add Assignment Form */}
        {showAddForm && activeTab === 'assignments' && (
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Asset to Personnel</h3>
            <form onSubmit={handleAssignmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Type
                </label>
                <select
                  value={assignmentFormData.equipmentType}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, equipmentType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  {equipmentTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name/Model
                </label>
                <input
                  type="text"
                  value={assignmentFormData.assetName}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, assetName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter asset name or model"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset ID / Serial Number
                </label>
                <input
                  type="text"
                  value={assignmentFormData.assetId}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, assetId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter asset ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personnel Name
                </label>
                <input
                  type="text"
                  value={assignmentFormData.personnelName}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, personnelName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter personnel name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base of Assignment
                </label>
                <select
                  value={assignmentFormData.base}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, base: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Base</option>
                  {bases.map(base => (
                    <option key={base.id} value={base.name}>{base.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Assignment
                </label>
                <input
                  type="text"
                  value={assignmentFormData.purpose}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter purpose"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={assignmentFormData.expectedReturnDate}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, expectedReturnDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={assignmentFormData.notes}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Assignment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Expenditure Form */}
        {showAddForm && activeTab === 'expenditures' && (
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Asset Expenditure</h3>
            <form onSubmit={handleExpenditureSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Type
                </label>
                <select
                  value={expenditureFormData.equipmentType}
                  onChange={(e) => setExpenditureFormData({...expenditureFormData, equipmentType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  {equipmentTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name/Model
                </label>
                <input
                  type="text"
                  value={expenditureFormData.assetName}
                  onChange={(e) => setExpenditureFormData({...expenditureFormData, assetName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter asset name or model"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Expended
                </label>
                <input
                  type="number"
                  value={expenditureFormData.quantity}
                  onChange={(e) => setExpenditureFormData({...expenditureFormData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expenditure Date
                </label>
                <input
                  type="date"
                  value={expenditureFormData.expenditureDate}
                  onChange={(e) => setExpenditureFormData({...expenditureFormData, expenditureDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base
                </label>
                <select
                  value={expenditureFormData.base}
                  onChange={(e) => setExpenditureFormData({...expenditureFormData, base: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Base</option>
                  {bases.map(base => (
                    <option key={base.id} value={base.name}>{base.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Expenditure
                </label>
                <select
                  value={expenditureFormData.reason}
                  onChange={(e) => setExpenditureFormData({...expenditureFormData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Reason</option>
                  <option value="Training">Training</option>
                  <option value="Combat Operation">Combat Operation</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Damage">Damage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reporting Personnel
                </label>
                <input
                  type="text"
                  value={expenditureFormData.reportingPersonnel}
                  onChange={(e) => setExpenditureFormData({...expenditureFormData, reportingPersonnel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reporting personnel name"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={expenditureFormData.notes}
                  onChange={(e) => setExpenditureFormData({...expenditureFormData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Expenditure
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Search ${activeTab}...`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {activeTab === 'assignments' ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{assignment.assetName}</div>
                          <div className="text-sm text-gray-500">{assignment.assetId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.base}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {assignment.assignmentDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.expectedReturnDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenditures.map((expenditure) => (
                  <tr key={expenditure.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expenditure.assetName}</div>
                          <div className="text-sm text-gray-500">{expenditure.equipmentType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.base}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        expenditure.reason === 'Training' ? 'bg-blue-100 text-blue-800' :
                        expenditure.reason === 'Combat Operation' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {expenditure.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {expenditure.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.reportedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
