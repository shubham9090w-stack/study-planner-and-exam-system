import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudyMaterial, Subject } from '../types';
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  FileCode,
  Check,
} from 'lucide-react';

export const SubjectsMaterialsView: React.FC = () => {
  const {
    subjects,
    materials,
    incrementDownload,
    setActiveExamId,
    setCurrentView,
  } = useApp();

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<number | null>(null);

  // Filter subjects
  const filteredSubjects = subjects.filter((s) => {
    if (selectedYear !== 'all' && s.bcaYear !== selectedYear) return false;
    if (selectedSemester !== 'all' && s.semester !== Number(selectedSemester)) return false;
    if (searchTerm) {
      const match =
        s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleDownload = (material: StudyMaterial) => {
    incrementDownload(material.id);

    // Create a downloadable text file representing the study material notes
    const blob = new Blob([material.contentPreview || `${material.title}\n\n${material.description}`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessId(material.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">BCA Subjects &amp; Study Repository</h1>
          <p className="text-sm text-slate-500">
            Curated syllabus, unit lecture notes, solved papers, and lab manuals for Semesters 1 to 6.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search code or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white w-48 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
          >
            <option value="all">All BCA Years</option>
            <option value="First Year">First Year (Sem 1 &amp; 2)</option>
            <option value="Second Year">Second Year (Sem 3 &amp; 4)</option>
            <option value="Third Year">Third Year (Sem 5 &amp; 6)</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
          >
            <option value="all">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Academic Subjects ({filteredSubjects.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => {
            const subjectMaterials = materials.filter((m) => m.subjectId === sub.id);

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {sub.subjectCode}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Sem {sub.semester} &bull; {sub.bcaYear}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {sub.subjectName}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{sub.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Study Materials:</span>
                    <span className="font-bold text-blue-600">
                      {subjectMaterials.length} files available
                    </span>
                  </div>

                  {subjectMaterials.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {subjectMaterials.slice(0, 2).map((mat) => (
                        <div
                          key={mat.id}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800 truncate max-w-[180px]">
                            {mat.title}
                          </span>
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => setPreviewMaterial(mat)}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded"
                              title="Preview Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownload(mat)}
                              className="p-1 text-slate-500 hover:text-emerald-600 rounded"
                              title="Download File"
                            >
                              {downloadSuccessId === mat.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setCurrentView('exams')}
                    className="w-full mt-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-blue-200"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Practice Test on this Subject &rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Materials Repository Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">All Permitted Study Files</h3>
            <p className="text-xs text-slate-500">
              Handwritten notes, university past papers, and quick reference cheat sheets
            </p>
          </div>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full">
            Verified Educational Resources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title &amp; Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Format &amp; Size</th>
                <th className="py-3 px-4">Downloads</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((mat) => {
                const sub = subjects.find((s) => s.id === mat.subjectId);

                return (
                  <tr key={mat.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p>{mat.title}</p>
                          <p className="text-[11px] text-slate-400 font-normal">
                            {sub?.subjectCode} - {sub?.subjectName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                        {mat.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      PDF &bull; {(mat.fileSizeKb / 1024).toFixed(1)} MB
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {mat.downloadCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setPreviewMaterial(mat)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleDownload(mat)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center space-x-1 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase">
                  {previewMaterial.category} Preview
                </span>
                <h3 className="text-base font-bold text-slate-900">{previewMaterial.title}</h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {previewMaterial.contentPreview || 'No preview available for this document.'}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Format: {previewMaterial.fileType} &bull; {(previewMaterial.fileSizeKb / 1024).toFixed(1)} MB
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewMaterial(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownload(previewMaterial);
                    setPreviewMaterial(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
