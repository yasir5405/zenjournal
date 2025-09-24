import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated 404 Number */}
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-bold text-muted select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-card/80 backdrop-blur-sm rounded-full p-8 shadow-lg border">
              <Search className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl bg-card backdrop-blur-sm border">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Page Not Found
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                We searched everywhere, but the page you're looking for seems to have wandered off into the digital wilderness.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-8 py-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-8 py-3 font-medium transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Lost? Try checking the URL or return to our homepage.
          </p>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please{" "}
            <a 
              href="mailto:support@zenjournal.com" 
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
