// utils/milestoneUtils.js
const compareMilestones = (oldMilestones, newMilestones, oldStatus, newStatus) => {
    if (!oldMilestones || !newMilestones || !oldStatus || !newStatus) {
        return null;
    }

    const oldMilestoneArray = oldMilestones.split(',');
    const newMilestoneArray = newMilestones.split(',');
    const oldStatusArray = oldStatus.split(',').map(Number);
    const newStatusArray = newStatus.split(',').map(Number);

    // Ensure arrays have the same length
    const maxLength = Math.max(
        oldMilestoneArray.length,
        newMilestoneArray.length,
        oldStatusArray.length,
        newStatusArray.length
    );

    // Check if progress was made (new status has more 1's than old status)
    const oldCompleted = oldStatusArray.filter(status => status === 1).length;
    const newCompleted = newStatusArray.filter(status => status === 1).length;

    if (newCompleted <= oldCompleted) {
        return null; // No progress made
    }

    // Find which milestone(s) made progress
    const progressedMilestones = [];
    for (let i = 0; i < maxLength; i++) {
        const oldStat = i < oldStatusArray.length ? oldStatusArray[i] : 0;
        const newStat = i < newStatusArray.length ? newStatusArray[i] : 0;
        
        if (oldStat === 0 && newStat === 1) {
            const milestoneName = i < newMilestoneArray.length && newMilestoneArray[i] 
                ? newMilestoneArray[i] 
                : `Stage ${i + 1}`;
                
            progressedMilestones.push({
                index: i,
                milestone: milestoneName,
                stageNumber: i + 1
            });
        }
    }

    return progressedMilestones.length > 0 ? progressedMilestones : null;
};

module.exports = { compareMilestones };