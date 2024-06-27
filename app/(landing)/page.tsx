import { Button } from "@/components/ui/button";
import  Link  from "next/link";
const DashboardPage = () => {
  return (<>
   <div>Landing page
    <div>
      <Link href="/sign-in">
      <Button>
        Login
      </Button>
      </Link>
      <Link href="/sign-up">
      <Button>
        Register
      </Button>
      </Link>
    </div>
   </div>
  
    </>
  );
}
export default DashboardPage;