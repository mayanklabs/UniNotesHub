import { GitGraphIcon } from "lucide-react"
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-gradient-to-br from-purple-600 to-blue-600/70 text-white border-t-0">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3">About</h3>
            <p className="text-sm text-white/90">
              A platform for university students to share and access previous
              year question papers. Help your juniors prepare better for their
              exams.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/90">
              <li>
                <a href="/" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a onClick={() => navigate('/uploadpyq')} className="hover:text-white">
                  Upload Paper
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Connect</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/mayankwebbing/UniNotesHub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white"
              >
                <GitGraphIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/30 text-center text-sm text-white/70">
          <p>
            © {new Date().getFullYear()} UniNotesHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
