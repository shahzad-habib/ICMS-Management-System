import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import api from '../../api/axios';
import { UserPlus, Pencil, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';

const EMPTY_ADD = { name: '', employeeId: '', department: '', password: '', phone: '' };

export default function TeacherManagement() {
  const { toast } = useToast();

  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Add modal ──────────────────────────────────────────────
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);

  // ── Edit modal ─────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', department: '', phone: '', password: '' });
  const [showEditPw, setShowEditPw] = useState(false);

  // ── Delete modal ───────────────────────────────────────────
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/teachers');
      setTeachers(res.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load teachers', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Create ─────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.employeeId || !addForm.department || !addForm.password) {
      toast({ title: 'Validation Error', description: 'Name, Employee ID, Department, and Password are required.', variant: 'destructive' });
      return;
    }
    setIsAdding(true);
    try {
      const res = await api.post('/admin/teachers', addForm);
      toast({ title: 'Success', description: 'Teacher created successfully.' });
      setTeachers([res.data.teacher, ...teachers]);
      setIsAddOpen(false);
      setAddForm(EMPTY_ADD);
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to create teacher', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  // ── Open Edit modal ────────────────────────────────────────
  const openEdit = (teacher) => {
    setEditTarget(teacher);
    setEditForm({
      employeeId: teacher.employeeId || '',
      name: teacher.name || '',
      department: teacher.department || '',
      phone: teacher.phone || '',
      password: '',
    });
    setShowEditPw(false);
    setIsEditOpen(true);
  };

  // ── Update ─────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.employeeId || !editForm.name || !editForm.department) {
      toast({ title: 'Validation Error', description: 'Employee ID, Name, and Department are required.', variant: 'destructive' });
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      toast({ title: 'Validation Error', description: 'New password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setIsEditing(true);
    try {
      const payload = {
        employeeId: editForm.employeeId.trim().toUpperCase(),
        name: editForm.name,
        department: editForm.department,
        phone: editForm.phone,
        ...(editForm.password ? { password: editForm.password } : {}),
      };
      const res = await api.patch(`/admin/teachers/${editTarget._id}`, payload);
      toast({ title: 'Success', description: 'Teacher updated successfully.' });
      setTeachers(teachers.map(t => t._id === editTarget._id ? res.data.teacher : t));
      setIsEditOpen(false);
      setEditTarget(null);
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update teacher', variant: 'destructive' });
    } finally {
      setIsEditing(false);
    }
  };

  // ── Toggle status ──────────────────────────────────────────
  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/admin/teachers/${id}/status`);
      toast({ title: 'Success', description: res.data.message });
      setTeachers(teachers.map(t => t._id === id ? { ...t, isActive: !t.isActive } : t));
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update status', variant: 'destructive' });
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const openDelete = (teacher) => {
    setDeleteTarget(teacher);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/teachers/${deleteTarget._id}`);
      toast({ title: 'Success', description: 'Teacher deleted successfully.' });
      setTeachers(teachers.filter((t) => t._id !== deleteTarget._id));
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete teacher',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#003E78]" /></div>;
  }

  return (
    <div className="space-y-3.5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a]">Staff Management</h2>
          <p className="text-xs text-[#64748b]">{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-[#003E78] hover:bg-[#002850] text-xs h-8 px-3 shadow-xs">
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Add Teacher
        </Button>
      </div>

      {/* Teachers Table */}
      <Card className="shadow-xs border border-[#e2e8f0]">
        <CardContent className="p-0">
          {teachers.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">No teachers registered yet. Click "Add Teacher" to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right min-w-[240px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher._id}>
                      <TableCell className="font-mono text-xs font-semibold text-[#003E78]">{teacher.employeeId}</TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">{teacher.name}</TableCell>
                      <TableCell className="text-[#475569] text-xs">{teacher.department || '—'}</TableCell>
                      <TableCell className="text-[#475569] text-xs">{teacher.phone || '—'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          teacher.isActive
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Edit */}
                          <Button
                            variant="outline"
                            onClick={() => openEdit(teacher)}
                            className="text-[11px] px-2 h-7 shadow-xs border-[#003E78]/30 text-[#003E78] hover:bg-[#003E78]/5"
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          {/* Toggle Active */}
                          <Button
                            variant="outline"
                            onClick={() => handleToggleStatus(teacher._id)}
                            className={`text-[11px] px-2 h-7 shadow-xs ${
                              teacher.isActive
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {teacher.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {/* Delete */}
                          <Button
                            variant="outline"
                            onClick={() => openDelete(teacher)}
                            className="text-[11px] px-2 h-7 shadow-xs border-red-200 text-red-600 hover:bg-red-50"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══ Add Teacher Modal ════════════════════════════════ */}
      <Modal isOpen={isAddOpen} onClose={() => !isAdding && setIsAddOpen(false)} title="Add New Teacher" description="Fill in the details to register a new staff member.">
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input required placeholder="e.g. Ali Khan" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Employee ID *</Label>
              <Input required placeholder="e.g. TCH02" value={addForm.employeeId} onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Input required placeholder="e.g. Mathematics" value={addForm.department} onChange={(e) => setAddForm({ ...addForm, department: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="e.g. 03001234567" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Temporary Password *</Label>
            <Input required type="password" placeholder="Min 6 characters" minLength={6} value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" className="bg-white border text-gray-700 hover:bg-gray-50" onClick={() => setIsAddOpen(false)} disabled={isAdding}>Cancel</Button>
            <Button type="submit" disabled={isAdding} className="bg-[#003E78] hover:bg-[#002850]">
              {isAdding ? 'Creating...' : 'Create Teacher'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══ Edit Teacher Modal ═══════════════════════════════ */}
      <Modal isOpen={isEditOpen} onClose={() => !isEditing && setIsEditOpen(false)} title="Edit Teacher">
        <form onSubmit={handleUpdate} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee ID *</Label>
              <Input
                required
                value={editForm.employeeId}
                onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Input required value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reset Password <span className="text-[#94a3b8] font-normal">(optional)</span></Label>
            <div className="relative">
              <Input
                type={showEditPw ? 'text' : 'password'}
                placeholder="Leave blank to keep current"
                minLength={6}
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="pr-10"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]" onClick={() => setShowEditPw(v => !v)} tabIndex={-1}>
                {showEditPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[#94a3b8]">Min 6 characters. Leave blank to keep unchanged.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" className="bg-white border text-gray-700 hover:bg-gray-50" onClick={() => setIsEditOpen(false)} disabled={isEditing}>Cancel</Button>
            <Button type="submit" disabled={isEditing} className="bg-[#003E78] hover:bg-[#002850]">
              {isEditing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══ Delete Confirmation Modal ══════════════════════════ */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !isDeleting && setIsDeleteOpen(false)}
        title="Delete Staff Member"
        description="Permanently remove teacher account and related data."
      >
        <div className="space-y-4 mt-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
            <p className="font-semibold text-sm mb-1 text-red-800">Are you sure?</p>
            <p>
              You are about to permanently delete <span className="font-bold text-red-900">{deleteTarget?.name}</span> ({deleteTarget?.employeeId}).
            </p>
            <p className="mt-1 text-[11px] text-red-600/90">
              This action cannot be undone. All attendance records and leave applications associated with this teacher will also be cleaned up.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="text-xs h-8 px-3 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs h-8 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
