import Progress from '../models/progress.js';

export const addProgress = async (req, res) => {
  try {
    const { skillname, stage, progress, userId, day } = req.body;

    // Validate required fields
    if (!skillname || stage === undefined || !Array.isArray(progress) || !userId || !day) {
      return res.status(400).json({
        success: false,
        message: 'All fields (skillname, stage, progress (as array), userId, day) are required'
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check if a progress record exists for same user, skill, stage and same day
    const existing = await Progress.findOne({
      userId,
      skillname,
      stage,
      day,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      // Update existing progress
      existing.progress = progress; // Replace instead of append for better control
      const updated = await existing.save();

      return res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: updated
      });
    }

    // Create new progress entry
    const newProgress = new Progress({ 
      skillname, 
      stage, 
      progress, 
      userId, 
      day 
    });
    const savedProgress = await newProgress.save();

    res.status(201).json({
      success: true,
      message: 'Progress added successfully',
      data: savedProgress
    });

  } catch (error) {
    console.error('Error adding/updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getProgressSummary = async (req, res) => {
  try {
    const { userId } = req.params; // or req.user.id if using auth middleware
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Fetch all progress records for the user
    const progressRecords = await Progress.find({ userId });

    if (!progressRecords || progressRecords.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No progress records found for this user' 
      });
    }

    // Create a summary object to group by skillname and stage
    const summaryMap = new Map();

    progressRecords.forEach(record => {
      const key = `${record.skillname}-${record.stage}`;
      
      // Calculate total reps for this record (sum of progress array)
      const totalReps = record.progress.reduce((sum, rep) => sum + rep, 0);
      
      // Find the highest single rep in this record
      const highestRep = Math.max(...record.progress);

      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key);
        
        // Update the summary with new data
        summaryMap.set(key, {
          ...existing,
          totalReps: existing.totalReps + totalReps,
          highestSingleRep: Math.max(existing.highestSingleRep, highestRep),
          recordCount: existing.recordCount + 1,
          lastUpdated: record.updatedAt > existing.lastUpdated ? record.updatedAt : existing.lastUpdated
        });
      } else {
        // Create new summary entry
        summaryMap.set(key, {
          skillname: record.skillname,
          stage: record.stage,
          day: record.day,
          totalReps: totalReps,
          highestSingleRep: highestRep,
          recordCount: 1,
          lastUpdated: record.updatedAt
        });
      }
    });

    // Convert map to array and sort by skillname and stage
    const summary = Array.from(summaryMap.values()).sort((a, b) => {
      if (a.skillname !== b.skillname) {
        return a.skillname.localeCompare(b.skillname);
      }
      return a.stage - b.stage;
    });

    // Create overall statistics
    const overallStats = {
      totalExercises: new Set(progressRecords.map(r => r.skillname)).size,
      totalStages: new Set(progressRecords.map(r => `${r.skillname}-${r.stage}`)).size,
      totalRecords: progressRecords.length,
      totalRepsAllTime: summary.reduce((sum, item) => sum + item.totalReps, 0),
      highestSingleRepAllTime: Math.max(...summary.map(item => item.highestSingleRep))
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        overallStats,
        userId
      }
    });

  } catch (error) {
    console.error('Error fetching progress summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getExerciseDetailSummary = async (req, res) => {
  try {
    const { userId, skillname } = req.params;
    
    if (!userId || !skillname) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and skill name are required' 
      });
    }

    const progressRecords = await Progress.find({ 
      userId, 
      skillname: { $regex: new RegExp(skillname, 'i') } // Case insensitive search
    });

    if (!progressRecords || progressRecords.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No progress records found for exercise: ${skillname}` 
      });
    }

    // Group by stage for this specific exercise
    const stageMap = new Map();

    progressRecords.forEach(record => {
      const totalReps = record.progress.reduce((sum, rep) => sum + rep, 0);
      const highestRep = Math.max(...record.progress);

      if (stageMap.has(record.stage)) {
        const existing = stageMap.get(record.stage);
        
        stageMap.set(record.stage, {
          ...existing,
          totalReps: existing.totalReps + totalReps,
          highestSingleRep: Math.max(existing.highestSingleRep, highestRep),
          sessionCount: existing.sessionCount + 1,
          progressHistory: [...existing.progressHistory, {
            date: record.updatedAt,
            reps: record.progress,
            totalReps: totalReps
          }]
        });
      } else {
        stageMap.set(record.stage, {
          stage: record.stage,
          totalReps: totalReps,
          highestSingleRep: highestRep,
          sessionCount: 1,
          progressHistory: [{
            date: record.updatedAt,
            reps: record.progress,
            totalReps: totalReps
          }]
        });
      }
    });

    const stageSummary = Array.from(stageMap.values()).sort((a, b) => a.stage - b.stage);

    // Sort progress history by date for each stage
    stageSummary.forEach(stage => {
      stage.progressHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    const exerciseStats = {
      skillname: progressRecords[0].skillname,
      day: progressRecords[0].day,
      totalSessions: progressRecords.length,
      totalStages: stageSummary.length,
      totalReps: stageSummary.reduce((sum, stage) => sum + stage.totalReps, 0),
      highestSingleRep: Math.max(...stageSummary.map(stage => stage.highestSingleRep)),
      currentStage: Math.max(...stageSummary.map(stage => stage.stage))
    };

    res.status(200).json({
      success: true,
      data: {
        exerciseStats,
        stageSummary,
        userId
      }
    });

  } catch (error) {
    console.error('Error fetching exercise detail summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};