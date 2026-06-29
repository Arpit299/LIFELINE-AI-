import { jsPDF } from 'jspdf';
import { Task } from '../types';

export const exportTasksToPDF = (tasks: Task[], userName = 'Hackathon Judge') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');

  // Page Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Custom Styles
  const primaryColor = [139, 92, 246]; // #8B5CF6 Violet
  const darkColor = [15, 15, 26]; // #0F0F1A Slate
  const lightGray = [240, 240, 245];

  // Header Background
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Header Content
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('LIFELINE AI', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(165, 180, 252);
  doc.text('Your AI Co-Pilot for Deadlines. Know what matters. Do it now.', 14, 25);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Generated For: ${userName}`, 14, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 50, 35);

  // Stats Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 45, pageWidth, 8, 'F');

  // Section: Urgent Action Items
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ACTIVE URGENCY BACKLOG', 14, 65);

  let y = 73;

  if (activeTasks.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 130);
    doc.text('No active tasks. Core workload cleared!', 14, y);
    y += 10;
  } else {
    // Sort active tasks by urgencyScore descending
    const sortedActive = [...activeTasks].sort((a, b) => b.urgencyScore - a.urgencyScore);

    sortedActive.forEach((task) => {
      // Check page boundary
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      // Card Container
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 24, 'F');
      
      // Left Highlight color based on score
      if (task.urgencyScore > 70) {
        doc.setFillColor(239, 68, 68); // Red
      } else if (task.urgencyScore > 40) {
        doc.setFillColor(245, 158, 11); // Amber
      } else {
        doc.setFillColor(16, 185, 129); // Green
      }
      doc.rect(14, y, 2, 24, 'F');

      // Task Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 15, 26);
      doc.text(task.title, 18, y + 6);

      // Task Deadline
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 110, 125);
      const formattedDeadline = new Date(task.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Due: ${formattedDeadline}`, 18, y + 11);

      // Score Callout
      doc.setFillColor(241, 245, 249);
      doc.rect(pageWidth - 38, y + 3, 20, 10, 'F');
      
      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      if (task.urgencyScore > 70) {
        doc.setTextColor(220, 38, 38);
      } else if (task.urgencyScore > 40) {
        doc.setTextColor(217, 119, 6);
      } else {
        doc.setTextColor(5, 150, 105);
      }
      doc.text(`SCORE: ${task.urgencyScore}`, pageWidth - 36, y + 9);

      // Task Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 60);
      const maxDescLength = 95;
      const descText = task.description.length > maxDescLength 
        ? task.description.substring(0, maxDescLength) + '...' 
        : task.description;
      doc.text(descText, 18, y + 17);

      // Next Action if analyzed
      if (task.aiAnalysis) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(139, 92, 246);
        doc.text(`AI Next Step: ${task.aiAnalysis.next_action}`, 18, y + 21);
      }

      y += 28;
    });
  }

  // Completed section
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('COMPLETED ARCHIVE', 14, y + 5);
  y += 12;

  if (completedTasks.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 130);
    doc.text('No completed tasks in this cycle yet.', 14, y);
  } else {
    completedTasks.forEach((task) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, pageWidth - 28, 12, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 110, 120);
      // Striking through is complex, so we will use checklist check icon instead
      doc.text(`[OK]  ${task.title}`, 18, y + 7.5);

      const compDate = task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '';
      doc.setFontSize(8);
      doc.text(`Completed: ${compDate}`, pageWidth - 45, y + 7.5);

      y += 16;
    });
  }

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 160);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, 287);
    doc.text('LIFELINE AI © 2026 — Secure Task Intel', 14, 287);
  }

  doc.save(`Lifeline_AI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
