import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Building2, MapPin, Clock, DollarSign, Search, CheckCircle2, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Job {
  id: string;
  title: string;
  company: string;
  companyVerified: boolean;
  location: string;
  type: "internship" | "full-time" | "part-time";
  salary: string;
  postedDate: string;
  description: string;
  requirements: string[];
}

export function JobHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "internship" | "job">("all");

  // Mock job data
  const jobs: Job[] = [
    {
      id: "1",
      title: "Software Engineering Intern",
      company: "TechCorp Inc.",
      companyVerified: true,
      location: "Remote",
      type: "internship",
      salary: "$25-30/hour",
      postedDate: "2 days ago",
      description: "Join our engineering team for a summer internship",
      requirements: ["React", "TypeScript", "Git"],
    },
    {
      id: "2",
      title: "Marketing Intern",
      company: "Brand Solutions",
      companyVerified: true,
      location: "New York, NY",
      type: "internship",
      salary: "$20/hour",
      postedDate: "5 days ago",
      description: "Help grow our social media presence",
      requirements: ["Social Media", "Content Creation", "Analytics"],
    },
    {
      id: "3",
      title: "Junior Developer",
      company: "StartupXYZ",
      companyVerified: true,
      location: "San Francisco, CA",
      type: "full-time",
      salary: "$70k-85k/year",
      postedDate: "1 week ago",
      description: "Build innovative web applications",
      requirements: ["JavaScript", "Node.js", "MongoDB"],
    },
    {
      id: "4",
      title: "Data Science Intern",
      company: "AI Research Labs",
      companyVerified: true,
      location: "Boston, MA",
      type: "internship",
      salary: "$28-32/hour",
      postedDate: "3 days ago",
      description: "Work on cutting-edge machine learning projects",
      requirements: ["Python", "Machine Learning", "Statistics"],
    },
    {
      id: "5",
      title: "Part-Time Tutor",
      company: "EduConnect",
      companyVerified: true,
      location: "Remote",
      type: "part-time",
      salary: "$18-22/hour",
      postedDate: "1 day ago",
      description: "Help students with math and science",
      requirements: ["Teaching", "Math", "Communication"],
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "all" ||
      (selectedType === "internship" && job.type === "internship") ||
      (selectedType === "job" && (job.type === "full-time" || job.type === "part-time"));

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "internship":
        return "bg-blue-100 text-blue-800";
      case "full-time":
        return "bg-green-100 text-green-800";
      case "part-time":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Hub</CardTitle>
          <CardDescription>
            Find internships and job opportunities from verified companies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="internship">Internships</TabsTrigger>
              <TabsTrigger value="job">Jobs</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="size-12">
                    <AvatarFallback>
                      <Building2 className="size-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-muted-foreground">{job.company}</p>
                            {job.companyVerified && (
                              <CheckCircle2 className="size-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                        <Button>Apply Now</Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="size-4" />
                          <Badge className={getTypeColor(job.type)}>
                            {job.type === "full-time"
                              ? "Full-time"
                              : job.type === "part-time"
                              ? "Part-time"
                              : "Internship"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="size-4" />
                          {job.salary}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {job.postedDate}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm">{job.description}</p>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
