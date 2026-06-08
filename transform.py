import re

file_path = "src/app/features/habits/GroupHabits.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. handleCreateGroup
# Look for the pattern including the manual state updates
create_pattern = re.compile(r'const handleCreateGroup = async \(\) => \{.*?setGroups\(prev => \[.*?\]\);\s+setProgress\(prev => \(.*?\}\)\);', re.DOTALL)

def replace_create(m):
    # Search for the newGroup definition inside the match
    block = m.group(0)
    group_match = re.search(r'const newGroup: GroupHabit = \{.*?\};', block, re.DOTALL)
    if group_match:
        new_group_def = group_match.group(0)
        return f"""const handleCreateGroup = async () => {{
    if (!newGroupName.trim()) return;

    {new_group_def}

    try {{
      await addGroup(newGroup);
      setNewGroupName("");
      setSelectedHabits([]);
      setShowCreateModal(false);
      setStatusMessage({{ type: "success", text: "Group created successfully!" }});
    }} catch (error) {{
      setStatusMessage({{ type: "error", text: "Failed to create group" }});
    }}
  }};"""
    return block

content = create_pattern.sub(replace_create, content)

# 2. handleJoinGroup - Already mostly handled by previous attempt but let's be sure
join_pattern = re.compile(r'const handleJoinGroup = async \(\) => \{.*?if \(groupToJoin\) \{.*?setGroups\(.*?\}\s+\} else \{', re.DOTALL)
join_replacement = 'const handleJoinGroup = async () => {\n    if (!joinCode.trim()) return;\n    const normalizedCode = joinCode.trim().toUpperCase();\n\n    try {\n      await joinGroup(normalizedCode);\n      setJoinCode("");\n      setShowJoinModal(false);\n      setStatusMessage({ type: "success", text: "Joined group successfully!" });\n    } catch (error) {'
content = join_pattern.sub(join_replacement, content)

# 3. handleLeaveGroup & 4. handleDeleteGroup
# Look for: const handleLeaveGroup = (groupId: string) => { ... setGroups(...) ... }
leave_pattern = re.compile(r'const handleLeaveGroup = \(groupId: string\) => \{.*?setGroups\(.*?\}\);', re.DOTALL)
leave_replacement = 'const handleLeaveGroup = async (groupId: string) => {\n    try {\n      await removeGroup(groupId);\n      setStatusMessage({ type: "success", text: "Left group successfully" });\n    } catch (error) {\n      setStatusMessage({ type: "error", text: "Failed to leave group" });\n    }\n  };'
content = leave_pattern.sub(leave_replacement, content)

delete_pattern = re.compile(r'const handleDeleteGroup = \(groupId: string\) => \{.*?setGroups\(.*?\}\);', re.DOTALL)
delete_replacement = 'const handleDeleteGroup = async (groupId: string) => {\n    try {\n      await removeGroup(groupId);\n      setStatusMessage({ type: "success", text: "Group deleted successfully" });\n    } catch (error) {\n      setStatusMessage({ type: "error", text: "Failed to delete group" });\n    }\n  };'
content = delete_pattern.sub(delete_replacement, content)

# 5. toggleGroupDate
toggle_pattern = re.compile(r'const toggleGroupDate = \(groupId: string, dateKey: string\) => \{.*?setGroups\(prev => prev\.map\(g =>.*?\}\)\);\s+setProgress\(prev => \(.*?\}\)\);', re.DOTALL)
toggle_replacement = """const toggleGroupDate = async (groupId: string, dateKey: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const newCompletedDates = { ...group.completedDates };
    if (newCompletedDates[dateKey]) {
      delete newCompletedDates[dateKey];
    } else {
      newCompletedDates[dateKey] = true;
    }

    try {
      await updateGroup({ ...group, completedDates: newCompletedDates });
    } catch (error) {
       setStatusMessage({ type: "error", text: "Failed to update progress" });
    }
  };"""
content = toggle_pattern.sub(toggle_replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
